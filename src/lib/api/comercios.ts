import { apiFetch } from "./client";
import type { EventListItem, EventProvider } from "./events";

/** One review left on a comercio, newest first from the API. */
export interface ComercioReview {
  id: string;
  authorName: string | null;
  body: string;
  rating: number | null;
  createdAt: string;
}

/** Public comercio profile: what a customer sees at allonsapp.com/<handle>. */
export interface ComercioProfile {
  id: string;
  name: string;
  handle: string | null;
  description: string | null;
  websiteUrl: string | null;
  instagramUrl: string | null;
  logoUrl: string | null;
  brandLogoColor: string | null;
  city: string | null;
  email: string | null;
  phone: string | null;
  followerCount: number;
  eventCount: number;
  classCount: number;
  rating: number | null;
  reviewCount: number;
  reviews: ComercioReview[];
  createdAt: string | null;
}

export interface ClassPackage {
  id: string;
  name: string;
  /** Lempiras, not cents. */
  price: number;
  credits: number;
  validityDays: number | null;
  kind: string;
  active: boolean;
  sortOrder: number;
}

export interface ClassSessionTemplate {
  id: string;
  /** 0 = Sunday … 6 = Saturday. */
  weekday: number;
  startTime: string;
  active: boolean;
}

/** A recurring class the comercio publishes; bought and booked from the app. */
export interface ClassProgramPublic {
  id: string;
  title: string;
  discipline: string | null;
  description: string | null;
  durationMinutes: number | null;
  instructorName: string | null;
  locationName: string | null;
  city: string | null;
  coverImageUrl: string | null;
  themeColor: string | null;
  status: string;
  packages: ClassPackage[];
  sessionTemplates: ClassSessionTemplate[];
}

export type ComercioEventScope = "upcoming" | "past" | "all";

/** The API returns raw event rows here; keep only what the cards use. */
interface ComercioEventRow {
  id: string;
  title: string;
  startsAt: string | null;
  endsAt: string | null;
  city: string | null;
  venue?: string | null;
  address?: string | null;
  coverImageUrl: string | null;
  hoverVideoUrl?: string | null;
  themeColor: string | null;
  minPriceCents: number | null;
  status?: string;
  types?: string[];
  eventType?: string | null;
  parkingAvailable?: boolean;
  petFriendly?: boolean;
  minAge?: number | null;
  capacity?: number | null;
  description?: string | null;
  category?: string | null;
  interests?: EventListItem["interests"];
  hiddenFromPublic?: boolean;
}

/**
 * `upcoming` on the API means "tickets are on sale", so a published event
 * whose sale has not opened is missing from both upcoming and past. The
 * profile lists every public event and splits by when it happens.
 */
function isListedComercioEvent(row: ComercioEventRow) {
  if (row.hiddenFromPublic) return false;
  if (!row.status) return true;
  return row.status === "published" || row.status === "sold_out" || row.status === "ended";
}

export function getComercio(idOrHandle: string) {
  return apiFetch<ComercioProfile>(
    `/providers/${encodeURIComponent(idOrHandle)}`,
    { auth: false },
  );
}

export async function listComercioEvents(
  id: string,
  scope: ComercioEventScope,
  provider: EventProvider,
): Promise<EventListItem[]> {
  const rows = await apiFetch<ComercioEventRow[]>(
    `/providers/${encodeURIComponent(id)}/events?scope=${scope}`,
    { auth: false },
  );
  return rows.filter(isListedComercioEvent).map((row) => ({
    id: row.id,
    title: row.title,
    startsAt: row.startsAt,
    endsAt: row.endsAt,
    city: row.city,
    venue: row.venue ?? null,
    address: row.address ?? null,
    coverImageUrl: row.coverImageUrl,
    hoverVideoUrl: row.hoverVideoUrl ?? null,
    themeColor: row.themeColor,
    minPriceCents: row.minPriceCents,
    status: row.status,
    types: row.types,
    eventType: row.eventType,
    parkingAvailable: row.parkingAvailable,
    petFriendly: row.petFriendly,
    minAge: row.minAge ?? null,
    capacity: row.capacity ?? null,
    description: row.description ?? null,
    category: row.category ?? null,
    interests: row.interests ?? null,
    provider,
  }));
}

/** An event is past once it has ended, otherwise it belongs on the profile. */
export function splitComercioEvents(events: EventListItem[], now = Date.now()) {
  const upcoming: EventListItem[] = [];
  const past: EventListItem[] = [];
  for (const event of events) {
    const raw = event.endsAt ?? event.startsAt;
    const when = raw ? new Date(raw).getTime() : NaN;
    const ended = event.status === "ended" || (Number.isFinite(when) && when < now);
    if (ended) past.push(event);
    else upcoming.push(event);
  }
  const byStart = (a: EventListItem, b: EventListItem) => {
    const ta = a.startsAt ? new Date(a.startsAt).getTime() : 0;
    const tb = b.startsAt ? new Date(b.startsAt).getTime() : 0;
    return ta - tb;
  };
  upcoming.sort(byStart);
  past.sort((a, b) => byStart(b, a));
  return { upcoming, past };
}

export function listComercioClassPrograms(id: string) {
  return apiFetch<ClassProgramPublic[]>(
    `/providers/${encodeURIComponent(id)}/class-programs`,
    { auth: false },
  );
}

export const comercioKeys = {
  profile: (key: string) => ["comercios", key] as const,
  events: (id: string, scope: ComercioEventScope) =>
    ["comercios", id, "events", scope] as const,
  classPrograms: (id: string) => ["comercios", id, "class-programs"] as const,
};

/** "1.2k" style follower counter, matching the app. */
export function formatCompactCount(count: number): string {
  if (count < 1000) return String(count);
  const thousands = count / 1000;
  const label = thousands >= 10 ? Math.round(thousands) : thousands.toFixed(1);
  return `${String(label).replace(".0", "")}k`;
}

/** Avatar fallback when the comercio has no logo. */
export function comercioInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].charAt(0).toUpperCase();
  return `${words[0].charAt(0)}${words[1].charAt(0)}`.toUpperCase();
}
