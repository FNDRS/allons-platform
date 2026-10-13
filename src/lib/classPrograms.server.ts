import { getApiUrl } from "@/lib/allons-api";

const TIMEOUT_MS = 3500;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** What the class page's metadata needs from `GET /class-programs/:id`. */
export type PublicClassProgramMeta = {
  id: string;
  title: string;
  description: string | null;
  discipline: string | null;
  city: string | null;
  locationName: string | null;
  coverImageUrl: string | null;
};

function readString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

/**
 * A published class program, fetched on the server so the page carries real
 * metadata and an unknown id becomes a real 404. `null` on any problem.
 */
export async function getPublicClassProgramMeta(
  id: string,
): Promise<PublicClassProgramMeta | null> {
  if (!UUID_RE.test(id)) return null;
  try {
    const response = await fetch(
      `${getApiUrl()}/class-programs/${encodeURIComponent(id)}`,
      { next: { revalidate: 300 }, signal: AbortSignal.timeout(TIMEOUT_MS) },
    );
    if (!response.ok) return null;
    const raw = (await response.json()) as Record<string, unknown> | null;
    const title = raw ? readString(raw.title) : null;
    if (!raw || !title) return null;
    return {
      id,
      title,
      description: readString(raw.description),
      discipline: readString(raw.discipline),
      city: readString(raw.city),
      locationName: readString(raw.locationName),
      coverImageUrl: readString(raw.coverImageUrl),
    };
  } catch {
    return null;
  }
}

/** Published class program ids for the sitemap. Empty on any problem. */
export async function listPublicClassProgramIds(): Promise<string[]> {
  try {
    const response = await fetch(`${getApiUrl()}/class-programs?limit=50`, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!response.ok) return [];
    const data: unknown = await response.json();
    if (!Array.isArray(data)) return [];
    return data.flatMap((item) => {
      const id = item && typeof item === "object" ? readString((item as Record<string, unknown>).id) : null;
      return id ? [id] : [];
    });
  } catch {
    return [];
  }
}
