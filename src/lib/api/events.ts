import { apiFetch } from "./client";

export type EventStatus = "published" | "sold_out" | "ended" | string;

export interface EventListItem {
  id: string;
  title: string;
  startsAt: string | null;
  endsAt: string | null;
  city: string | null;
  venue?: string | null;
  address?: string | null;
  coverImageUrl: string | null;
  /** Video corto que se reproduce al pasar el mouse sobre la tarjeta. */
  hoverVideoUrl?: string | null;
  themeColor: string | null;
  minPriceCents: number | null;
  status?: EventStatus;
  types?: string[];
  eventType?: string | null;
  parkingAvailable?: boolean;
  petFriendly?: boolean;
  minAge?: number | null;
  capacity?: number | null;
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
  capacity?: number | null;
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

/** Lo que costaría una compra, con el recargo que calcula el servidor. */
export interface EventQuote {
  feeMode: "provider_absorbs" | "buyer_pays_gateway" | "buyer_pays_all";
  quantity: number;
  unitPriceCents: number;
  /** Boletos más aporte, el precio que publicó el comercio. */
  subtotalCents: number;
  /** Cargo agregado al total del comprador. Cero cuando lo absorbe el comercio. */
  serviceChargeCents: number;
  /** Lo que se le cobra a la tarjeta. */
  totalCents: number;
}

/**
 * El total lo calcula el servidor, no la web.
 *
 * La pasarela cobra su tasa sobre la captura completa, recargo incluido, así
 * que sumar un porcentaje plano aquí daría una cifra distinta de la que se
 * cobra. Una sola fórmula, del lado que cobra.
 */
export function getEventQuote(
  id: string,
  params: { entryTypeId?: string | null; quantity: number; donationCents: number },
) {
  const query = new URLSearchParams({
    quantity: String(params.quantity),
    donationCents: String(params.donationCents),
  });
  if (params.entryTypeId) query.set("entryTypeId", params.entryTypeId);
  return apiFetch<EventQuote>(
    `/events/${encodeURIComponent(id)}/quote?${query.toString()}`,
    { auth: false },
  );
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
  quote: (
    id: string,
    entryTypeId: string | null,
    quantity: number,
    donationCents: number,
  ) => ["events", id, "quote", entryTypeId ?? "any", quantity, donationCents] as const,
};

export function isEntryTypeOnSale(type: EventEntryType, now = Date.now()) {
  if (type.saleStartsAt && new Date(type.saleStartsAt).getTime() > now)
    return false;
  if (type.saleEndsAt && new Date(type.saleEndsAt).getTime() < now)
    return false;
  return true;
}
