import { apiFetch } from "./client";

export type EventStatus = "published" | "sold_out" | "ended" | string;

export interface EventListItem {
  id: string;
  title: string;
  startsAt: string | null;
  endsAt: string | null;
  city: string | null;
  coverImageUrl: string | null;
  themeColor: string | null;
  minPriceCents: number | null;
  status?: EventStatus;
  types?: string[];
  eventType?: string | null;
  provider?: EventProvider | null;
}

export interface EventEntryType {
  id: string;
  name: string;
  priceCents: number;
  saleStartsAt: string | null;
  saleEndsAt: string | null;
  donationEnabled?: boolean;
  soldOut?: boolean;
  remaining: number | null;
  planKind?: string | null;
}

export type EventQuestionKind =
  | "text"
  | "textarea"
  | "number"
  | "date"
  | "select"
  | "radio"
  | "checkbox"
  | "boolean";

export interface EventQuestion {
  id: string;
  label: string;
  kind: EventQuestionKind | string;
  options?: string[] | null;
  required: boolean;
  sortOrder: number;
}

export interface PublicResource {
  id: string;
  label: string;
  sortOrder: number;
  taken: boolean;
}

export interface PublicResourceGroup {
  id: string;
  name: string;
  description: string | null;
  required: boolean;
  columns: number | null;
  sortOrder: number;
  total: number;
  available: number;
  resources: PublicResource[];
}

export interface EventProvider {
  id: string;
  name: string;
  handle?: string | null;
  logoUrl?: string | null;
  description?: string | null;
  websiteUrl?: string | null;
}

export interface EventDetail extends EventListItem {
  description: string | null;
  venue: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  ticketMode?: string;
  capacity?: number;
  attendeeCount?: number;
  provider: EventProvider | null;
  gallery?: Array<{ id: string; url: string }>;
  entryTypes: EventEntryType[];
  questions: EventQuestion[];
  resourceGroups?: PublicResourceGroup[];
  refundPolicy?: "none" | "partial" | "full";
  refundPartialPct?: number | null;
  refundDeadlineDays?: number | null;
  kitPickupInfo?: string | null;
}

export function listEvents() {
  return apiFetch<EventListItem[]>("/events", { auth: false });
}

export function getEvent(id: string) {
  return apiFetch<EventDetail>(`/events/${encodeURIComponent(id)}`, {
    auth: false,
  });
}

export function getEventResources(id: string) {
  return apiFetch<{ groups: PublicResourceGroup[] }>(
    `/events/${encodeURIComponent(id)}/resources`,
    { auth: false },
  );
}

export const eventKeys = {
  list: ["events"] as const,
  detail: (id: string) => ["events", id] as const,
  resources: (id: string) => ["events", id, "resources"] as const,
};

export function isEntryTypeOnSale(type: EventEntryType, now = Date.now()) {
  if (type.saleStartsAt && new Date(type.saleStartsAt).getTime() > now)
    return false;
  if (type.saleEndsAt && new Date(type.saleEndsAt).getTime() < now)
    return false;
  return true;
}
