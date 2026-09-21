const DEFAULT_API_URL =
  process.env.NODE_ENV === "development"
    ? "http://127.0.0.1:3000"
    : "https://uabcpmxq39.us-east-2.awsapprunner.com";

/** Cuánto se reutiliza la respuesta antes de volver a pedirla. */
const REVALIDATE_SECONDS = 300;

/** Un evento que tarda en responder no debe colgar el render de la página. */
const TIMEOUT_MS = 3500;

export type PublicEvent = {
  id: string;
  title: string;
  city: string | null;
  startsAt: string | null;
  coverImageUrl: string | null;
  providerName: string | null;
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

    const provider = raw.provider;
    const providerName =
      provider && typeof provider === "object"
        ? readString((provider as Record<string, unknown>).name)
        : null;

    return {
      id,
      title,
      city: readString(raw.city),
      startsAt: readString(raw.startsAt),
      coverImageUrl: readString(raw.coverImageUrl),
      providerName,
    };
  } catch {
    return null;
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
