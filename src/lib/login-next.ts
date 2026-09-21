import { isComercioUser } from "@/lib/role";

export const LOGIN_NEXT_KEY = "allons.login.next";
const NEXT_TTL_MS = 60 * 60 * 1000;

/**
 * Persist where to go after an OAuth or email round-trip. Query params on
 * the Supabase redirect are dropped when the URL is not an exact allow-list
 * match, and the session then lands on `/`.
 */
export function rememberLoginNext(next: string) {
  try {
    window.localStorage.setItem(
      LOGIN_NEXT_KEY,
      JSON.stringify({ next, at: Date.now() }),
    );
  } catch {
    /* the user lands on /events */
  }
}

export function peekLoginNext(): string | null {
  try {
    const raw = window.localStorage.getItem(LOGIN_NEXT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { next?: unknown; at?: unknown };
    if (typeof parsed.next !== "string" || typeof parsed.at !== "number") {
      return null;
    }
    if (Date.now() - parsed.at > NEXT_TTL_MS) {
      forgetLoginNext();
      return null;
    }
    return parsed.next;
  } catch {
    return null;
  }
}

export function takeLoginNext(): string | null {
  const next = peekLoginNext();
  forgetLoginNext();
  return next;
}

export function forgetLoginNext() {
  try {
    window.localStorage.removeItem(LOGIN_NEXT_KEY);
  } catch {
    /* nothing to clean */
  }
}

/** Only a same-origin path: no protocol-relative, no backslash tricks. */
export function safeLoginNext(raw: string | null): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//") || /[\\\s]/.test(raw)) {
    return "/events";
  }
  try {
    const url = new URL(raw, "https://allonsapp.com");
    if (url.origin !== "https://allonsapp.com") return "/events";
    return url.pathname + url.search;
  } catch {
    return "/events";
  }
}

/** A comercio lands on its panel unless it was already going to /comercio. */
export function homeFor(
  user: Parameters<typeof isComercioUser>[0],
  next: string,
): string {
  if (isComercioUser(user) && !next.startsWith("/comercio")) return "/comercio";
  return next;
}
