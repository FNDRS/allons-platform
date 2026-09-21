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
  logoUrl: string | null;
  brandLogoColor: string | null;
  city: string | null;
  email: string | null;
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
  coverImageUrl: string | null;
  themeColor: string | null;
  minPriceCents: number | null;
  status?: string;
  types?: string[];
  eventType?: string | null;
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
  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    startsAt: row.startsAt,
    endsAt: row.endsAt,
    city: row.city,
    coverImageUrl: row.coverImageUrl,
    themeColor: row.themeColor,
    minPriceCents: row.minPriceCents,
    status: row.status,
    types: row.types,
    eventType: row.eventType,
    provider,
  }));
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
