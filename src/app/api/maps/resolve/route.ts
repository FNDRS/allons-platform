import { NextRequest, NextResponse } from "next/server";
import {
  isShortGoogleMapsLink,
  parseGoogleMapsLink,
  type MapCoordinates,
} from "@/lib/googleMapsLink";
import { clientIp, isSameOrigin, rateLimit } from "@/lib/request-guard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_REDIRECTS = 5;
const TIMEOUT_MS = 8_000;
const RATE_LIMIT = { limit: 30, windowMs: 10 * 60 * 1000 };
// Without a browser user agent Google answers the short link with a page that
// has no coordinates in it.
const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";

/**
 * Every origin this route may fetch, keyed by hostname. The request URL is
 * always built from one of these constants plus the path, never from the host
 * the caller sent, so the route cannot be pointed at another server.
 */
const ALLOWED_ORIGINS: Readonly<Record<string, string>> = {
  "maps.app.goo.gl": "https://maps.app.goo.gl",
  "goo.gl": "https://goo.gl",
  "g.co": "https://g.co",
  "google.com": "https://google.com",
  "www.google.com": "https://www.google.com",
  "maps.google.com": "https://maps.google.com",
  "consent.google.com": "https://consent.google.com",
  "www.google.hn": "https://www.google.hn",
  "maps.google.hn": "https://maps.google.hn",
};

/** The same path and query on its allowlisted origin, or null off the list. */
function toAllowedUrl(raw: string): string | null {
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    return null;
  }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return null;
  if (parsed.username || parsed.password || parsed.port) return null;
  const origin = ALLOWED_ORIGINS[parsed.hostname.toLowerCase()];
  if (!origin) return null;
  return `${origin}${parsed.pathname}${parsed.search}`;
}

/**
 * Follows a short link hop by hop and stops as soon as one leaves Google, so
 * this route can never be used to fetch an arbitrary URL from the server.
 */
async function resolveShortLink(url: string): Promise<MapCoordinates | null> {
  let current = url;
  for (let hop = 0; hop <= MAX_REDIRECTS; hop += 1) {
    const fromUrl = parseGoogleMapsLink(current);
    if (fromUrl) return fromUrl;
    const target = toAllowedUrl(current);
    if (!target) return null;

    const response = await fetch(target, {
      redirect: "manual",
      headers: { "User-Agent": USER_AGENT },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    const location = response.headers.get("location");
    if (response.status >= 300 && response.status < 400 && location) {
      current = new URL(location, target).toString();
      continue;
    }
    // Some links land on a consent page with the coordinates only in the HTML.
    if (!response.ok) return null;
    return parseGoogleMapsLink((await response.text()).slice(0, 500_000));
  }
  return null;
}

/**
 * Expands a Google Maps share link into coordinates. It lives on the server
 * because Google sends no CORS headers, so the browser cannot follow the
 * redirect itself.
 */
export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) {
    return NextResponse.json({ error: "Origen no permitido" }, { status: 403 });
  }
  const ip = clientIp(req);
  if (!rateLimit(`maps:${ip ?? "unknown"}`, RATE_LIMIT.limit, RATE_LIMIT.windowMs)) {
    return NextResponse.json(
      { error: "Demasiados intentos. Espera unos minutos." },
      { status: 429, headers: { "Retry-After": "600" } },
    );
  }

  let url = "";
  try {
    const body = (await req.json()) as { url?: unknown };
    url = typeof body.url === "string" ? body.url.trim().slice(0, 2_000) : "";
  } catch {
    return NextResponse.json({ error: "Body inválido." }, { status: 400 });
  }
  if (!url) {
    return NextResponse.json({ error: "Falta el link." }, { status: 400 });
  }

  const direct = parseGoogleMapsLink(url);
  if (direct) return NextResponse.json(direct);
  if (!isShortGoogleMapsLink(url)) {
    return NextResponse.json(
      { error: "El link no es de Google Maps o no tiene coordenadas." },
      { status: 422 },
    );
  }

  try {
    const coords = await resolveShortLink(url);
    if (coords) return NextResponse.json(coords);
  } catch {
    // Timeout or network error: reported as unreadable below.
  }
  return NextResponse.json(
    { error: "No pudimos leer la ubicación de ese link." },
    { status: 422 },
  );
}
