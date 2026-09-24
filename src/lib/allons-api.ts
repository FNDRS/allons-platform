const DEFAULT_API_URL =
  process.env.NODE_ENV === "development"
    ? "http://127.0.0.1:3000"
    : "https://api.allonsapp.com";

/** Cuánto se reutiliza la respuesta antes de volver a pedirla. */
const REVALIDATE_SECONDS = 300;

/** Un evento que tarda en responder no debe colgar el render de la página. */
const TIMEOUT_MS = 3500;

import type { ComercioProfile } from "@/lib/api/comercios";

/**
 * Handles are short slugs; anything else (a file name, an odd path) is not
 * worth a round trip to the API and can 404 right away.
 */
export const COMERCIO_HANDLE_RE = /^[a-z0-9][a-z0-9._-]{1,48}$/i;

/**
 * Public comercio profile for `allonsapp.com/<handle>`, fetched on the
 * server so the page ships rendered and carries real metadata. `null` on
 * any problem so the route can fall through to the 404 page.
 */
export async function getPublicComercio(
  handle: string,
): Promise<ComercioProfile | null> {
  const key = handle.trim();
  if (!COMERCIO_HANDLE_RE.test(key)) return null;
  try {
    const response = await fetch(
      `${getApiUrl()}/providers/${encodeURIComponent(key)}`,
      {
        next: { revalidate: 120 },
        signal: AbortSignal.timeout(TIMEOUT_MS),
      },
    );
    if (!response.ok) return null;
    const data = (await response.json()) as ComercioProfile;
    return data && typeof data === "object" && typeof data.id === "string"
      ? data
      : null;
  } catch {
    return null;
  }
}

export type PublicEvent = {
  id: string;
  title: string;
  city: string | null;
  startsAt: string | null;
  endsAt: string | null;
  venue: string | null;
  address: string | null;
  description: string | null;
  coverImageUrl: string | null;
  providerName: string | null;
  providerHandle: string | null;
  /** Lowest entry price in cents (HNL), from the entry types. */
  minPriceCents: number | null;
  status: string | null;
};

/** What the sitemap needs from `GET /events`. */
export type PublicEventSummary = {
  id: string;
  startsAt: string | null;
};

function getApiUrl() {
  return (process.env.ALLONS_API_URL?.trim() || DEFAULT_API_URL).replace(
    /\/+$/,
    "",
  );
}

function readString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

/**
 * Un evento público, para las páginas compartidas.
 *
 * `GET /events/:id` es abierto (así lo consume la app para invitados), así que
 * no hace falta credencial. Devuelve `null` ante cualquier problema —evento
 * borrado, API caída, respuesta rara— porque quien llama siempre tiene un texto
 * de respaldo: la página compartida debe cargar aunque no se sepa qué evento es.
 */
export async function getPublicEvent(id: string): Promise<PublicEvent | null> {
  if (!id.trim()) return null;

  try {
    const response = await fetch(
      `${getApiUrl()}/events/${encodeURIComponent(id)}`,
      {
        next: { revalidate: REVALIDATE_SECONDS },
        signal: AbortSignal.timeout(TIMEOUT_MS),
      },
    );
    if (!response.ok) return null;

    const data: unknown = await response.json();
    if (!data || typeof data !== "object") return null;
    const raw = data as Record<string, unknown>;

    const title = readString(raw.title);
    if (!title) return null;

    const provider =
      raw.provider && typeof raw.provider === "object"
        ? (raw.provider as Record<string, unknown>)
        : null;

    return {
      id,
      title,
      city: readString(raw.city),
      startsAt: readString(raw.startsAt),
      endsAt: readString(raw.endsAt),
      venue: readString(raw.venue),
      address: readString(raw.address),
      description: readString(raw.description),
      coverImageUrl: readString(raw.coverImageUrl),
      providerName: provider ? readString(provider.name) : null,
      providerHandle: provider ? readString(provider.handle) : null,
      minPriceCents: readMinPrice(raw),
      status: readString(raw.status),
    };
  } catch {
    return null;
  }
}

function readMinPrice(raw: Record<string, unknown>): number | null {
  if (typeof raw.minPriceCents === "number") return raw.minPriceCents;
  if (!Array.isArray(raw.entryTypes)) return null;
  const prices = raw.entryTypes
    .map((entry) =>
      entry && typeof entry === "object"
        ? (entry as Record<string, unknown>).priceCents
        : null,
    )
    .filter((price): price is number => typeof price === "number");
  return prices.length ? Math.min(...prices) : null;
}

/**
 * Public event ids for the sitemap. An empty list on any problem: the
 * sitemap still lists the static pages when the API is down.
 */
export async function listPublicEvents(): Promise<PublicEventSummary[]> {
  try {
    const response = await fetch(`${getApiUrl()}/events`, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!response.ok) return [];
    const data: unknown = await response.json();
    if (!Array.isArray(data)) return [];
    return data.flatMap((item) => {
      if (!item || typeof item !== "object") return [];
      const raw = item as Record<string, unknown>;
      const id = readString(raw.id);
      return id ? [{ id, startsAt: readString(raw.startsAt) }] : [];
    });
  } catch {
    return [];
  }
}

/**
 * "Sábado, 22 de agosto, 4:00 p. m."
 *
 * En hora de Honduras y no en la del servidor: quien lee el enlace está donde
 * ocurre el evento, y el servidor corre en UTC.
 */
export function formatEventWhen(startsAt: string | null): string | null {
  if (!startsAt) return null;
  const date = new Date(startsAt);
  if (Number.isNaN(date.getTime())) return null;

  const label = date.toLocaleString("es-HN", {
    timeZone: "America/Tegucigalpa",
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "numeric",
    minute: "2-digit",
  });
  return label.charAt(0).toUpperCase() + label.slice(1);
}
