import { apiFetch, downloadFile } from "./client";
import type { EventDonationInfo } from "@/lib/eventDonations";
import type { EventQuestionKind } from "./events";

/** What Allons and the pasarela withhold from each sale, as percentages. */
export interface ProviderCommission {
  plan: string | null;
  planName: string | null;
  baseFee: number;
  pasarelaFee: number;
  totalFee: number;
}

export interface ProviderPayout {
  id: string;
  /** Lempiras. */
  amount: number;
  method: string;
  /** "pending" until the operator makes the transfer, then "completed". */
  status: string;
  date: string;
}

export interface ProviderDashboard {
  availableBalance: number;
  pendingBalance: number;
  heldBalance: number;
  platformFee: number;
  commission?: ProviderCommission;
  totals: {
    gross: number;
    fees: number;
    net: number;
    soldTickets: number;
    scans: number;
    courtesyTickets: number;
  };
  events: unknown[];
  payouts?: ProviderPayout[];
}

/** A comercio as it appears on a shared event: the host or a collaborator. */
export interface CollaboratorProvider {
  id: string;
  name: string;
  handle: string | null;
  logoUrl: string | null;
}

export interface EventCollaborator {
  id: string;
  provider: CollaboratorProvider;
  /** "pending" until the invited comercio accepts, then "accepted". */
  status: string;
  invitedByAdmin: boolean;
  invitedAt: string;
  respondedAt: string | null;
}

/**
 * How the signed-in comercio relates to an event: it owns it (and gets
 * paid for it) or it was invited on as a collaborator and sees the same
 * numbers without owning them.
 */
export type EventAccess = "owner" | "collaborator";

/**
 * `pending_review` and `rejected` come from Allons' review: an event sent
 * with `published` waits for an admin unless it was already public.
 */
export type ProviderEventStatus =
  | "draft"
  | "pending_review"
  | "rejected"
  | "published"
  | "sold_out"
  | "ended";

export interface ProviderEventListItem {
  id: string;
  title: string;
  startsAt: string | null;
  endsAt: string | null;
  city: string | null;
  /** A `ProviderEventStatus`, kept as a string for values added later. */
  status: string;
  /** Missing on an API that predates review. */
  submittedForReviewAt?: string | null;
  reviewedAt?: string | null;
  /** Why an Allons admin rejected it, while `status` is `rejected`. */
  reviewRejectReason?: string | null;
  eventType: string;
  ticketMode: string;
  capacity: number;
  ticketsSold: number;
  revenue: number;
  contributions: number;
  attendees: number;
  scans: number;
  coverImageUrl: string | null;
  themeColor: string | null;
  access: EventAccess;
  host: CollaboratorProvider | null;
  /** Invited (pending) and accepted collaborators, besides the host. */
  collaborators: EventCollaborator[];
}

export interface ProviderTicketType {
  id: string;
  name: string;
  kind: string;
  /** Lempiras. */
  price: number;
  total: number;
  sold: number;
  saleStartsAt: string | null;
  saleEndsAt: string | null;
  /** Buyers can pay more than the price as a contribution. */
  donationEnabled: boolean;
  /** Contribution offered at checkout, in lempiras. Null without one. */
  suggestedDonation?: number | null;
}

/** A registration-form question as the event detail returns it. */
export interface ProviderEventQuestion {
  id: string;
  label: string;
  kind: string;
  options?: string[] | null;
  required: boolean;
  sortOrder?: number;
  /** Set on questions a campaign hub copied in; those are not the comercio's. */
  campaignQuestionId?: string | null;
}

export interface ProviderEventDetail extends ProviderEventListItem {
  description: string | null;
  venue: string | null;
  address: string | null;
  /** Set when the spot was pinned on the app's map; the pin decides the city. */
  latitude?: number | null;
  longitude?: number | null;
  /** App images, cover first. */
  gallery?: Array<{ id: string; url: string; sortOrder: number }>;
  category?: string | null;
  ticketTypes: ProviderTicketType[];
  /** The comercio's own questions. Older APIs mixed campaign copies in. */
  questions: ProviderEventQuestion[];
  /** Questions a campaign hub added; read-only for the comercio. */
  campaignQuestions?: ProviderEventQuestion[];
  kitPickupInfo?: string | null;
  /** Where to donate straight to a beneficiary. Missing on older APIs. */
  donationInfo?: EventDonationInfo | null;
  refundPolicy?: string;
  refundPartialPct?: number | null;
  refundDeadlineDays?: number | null;
  minAge?: number | null;
  smokingAllowed?: boolean;
  petFriendly?: boolean;
  parkingAvailable?: boolean;
}

export interface HourlySales {
  hours: number[];
  total: number;
  date: string;
  timeZone: string;
}

export interface ProviderPaymentRow {
  orderId: string;
  status: string;
  amountCents: number;
  currency: string;
  quantity: number;
  buyerUserId: string;
  createdAt: string;
  entryTypeId?: string | null;
  donationCents?: number;
  holders?: Array<{ name: string }>;
  /** How the charge split at capture time. Null on an order predating the split, where the whole charge was the subtotal. */
  subtotalCents?: number | null;
  serviceChargeCents?: number | null;
  /** Allons' commission withheld from the comercio. */
  allonsFeeCents?: number | null;
  /** ISV on the commission, when the event has a nonzero rate configured. */
  isvCents?: number | null;
  /** What the payment gateway takes out of the charge. */
  gatewayCostCents?: number | null;
  /** The gateway's own reference for this charge. */
  authCode?: string | null;
}

/** A free reservation: tickets with no payment order, grouped by when they were minted. */
export interface ProviderFreeReservation {
  /** Its first ticket's id; there is no order. */
  reservationId: string;
  quantity: number;
  createdAt: string;
  entryTypeId: string | null;
  buyerUserId: string | null;
  buyerName: string | null;
  holders: Array<{ name: string }>;
}

export interface ProviderPayments {
  eventId: string;
  eventTitle: string;
  summary: Record<string, unknown>;
  data: ProviderPaymentRow[];
  /** Missing on an API that predates free reservations in this list. */
  reservations?: ProviderFreeReservation[];
}

export interface ProviderResource {
  id: string;
  label: string;
  sortOrder: number;
  /** Cell on the studio map, zero-based. Both null when the unit flows in order. */
  row: number | null;
  col: number | null;
  active: boolean;
  ticket: {
    id: string;
    code: string;
    holderName: string | null;
    holderEmail: string | null;
    assignedAt: string | null;
  } | null;
}

export interface ProviderResourceGroup {
  id: string;
  name: string;
  description: string | null;
  required: boolean;
  columns: number | null;
  sortOrder: number;
  total: number;
  assigned: number;
  /** Schedule this map belongs to. Null covers every ticket type. */
  ticketTypeId?: string | null;
  resources: ProviderResource[];
}

export interface ResourceGroupInput {
  id?: string;
  name: string;
  description?: string | null;
  required?: boolean;
  columns?: number | null;
  labels: string[];
  /**
   * The map as rows of cells: a label places that unit, null leaves a gap.
   * Omitted keeps the cells the group already has (drawn in the admin).
   */
  layout?: Array<Array<string | null>> | null;
}

export interface ProviderDiscount {
  id: string;
  code: string;
  /** 1–100. */
  percent: number;
  uses: number;
  maxUses: number;
  active: boolean;
  /** Null cuando el código aplica a todos los eventos del comercio. */
  eventId: string | null;
  eventTitle: string | null;
  createdAt: string;
}

export interface ProviderDiscountInput {
  code: string;
  percent: number;
  maxUses: number;
  /** Omite o pasa null para que el código aplique a todos los eventos. */
  eventId?: string | null;
}

export function listProviderDiscounts() {
  return apiFetch<ProviderDiscount[]>("/provider/discounts");
}

export function createProviderDiscount(input: ProviderDiscountInput) {
  return apiFetch<ProviderDiscount[]>("/provider/discounts", {
    method: "POST",
    body: input,
  });
}

export function updateProviderDiscount(
  id: string,
  patch: Partial<ProviderDiscountInput & { active: boolean }>,
) {
  return apiFetch<{ updated: true }>(
    `/provider/discounts/${encodeURIComponent(id)}`,
    { method: "PATCH", body: patch },
  );
}

export function deleteProviderDiscount(id: string) {
  return apiFetch<{ deleted: true }>(
    `/provider/discounts/${encodeURIComponent(id)}`,
    { method: "DELETE" },
  );
}

export type StaffRole = "scanner" | "admin";

export interface StaffMember {
  userId: string;
  role: StaffRole | string;
  isOwner?: boolean;
  name: string | null;
  email: string | null;
  phone?: string | null;
  active: boolean;
  avatarColor?: string | null;
}

export function getProviderDashboard() {
  return apiFetch<ProviderDashboard>("/provider/dashboard");
}

/** The comercio the signed-in member belongs to. */
export interface ProviderProfile {
  id: string;
  name: string;
  handle: string | null;
  logoUrl: string | null;
}

export function getProviderProfile() {
  return apiFetch<ProviderProfile>("/provider/profile");
}

/**
 * Body of POST/PATCH `/provider/events` (CreateEventDto / UpdateEventDto).
 * Ticket types are not part of it: they have their own endpoints.
 */
export interface ProviderEventInput {
  title: string;
  description: string | null;
  /** ISO instant. */
  startsAt: string | null;
  endsAt: string | null;
  city?: string | null;
  venue: string | null;
  address?: string | null;
  /** Map pin; both or neither. Omit to keep the stored one, null clears it. */
  latitude?: number | null;
  longitude?: number | null;
  coverImageUrl: string | null;
  /** Image URLs, cover first. Omit to keep the stored gallery. */
  gallery?: string[];
  category: string | null;
  eventType: "single";
  /** "free" when no ticket is paid, "single_access" otherwise, as the app sends. */
  ticketMode: "free" | "single_access";
  /** 0 means no event-wide limit. */
  capacity: number;
  refundPolicy: "none" | "partial" | "full";
  refundPartialPct: number | null;
  refundDeadlineDays: number | null;
  minAge: number | null;
  smokingAllowed: boolean;
  petFriendly: boolean;
  parkingAvailable: boolean;
  /** Empty clears it. */
  kitPickupInfo: string;
  /**
   * Replaces the comercio's own questions (campaign copies stay). Omit to
   * keep the stored ones; send it only when they changed.
   */
  questions?: ProviderEventQuestionInput[];
  /** Omit to keep the stored one, null removes it. */
  donationInfo?: EventDonationInfo | null;
  /** `published` goes to review unless the event is already public. */
  status: "draft" | "published";
}

export interface ProviderEventQuestionInput {
  label: string;
  kind: EventQuestionKind;
  /** Only on select, radio and checkbox, with 1 to 20 entries. */
  options?: string[];
  required: boolean;
  sortOrder: number;
}

export function createProviderEvent(body: ProviderEventInput) {
  return apiFetch<ProviderEventDetail>("/provider/events", {
    method: "POST",
    body,
  });
}

export function updateProviderEvent(
  id: string,
  body: Partial<ProviderEventInput>,
) {
  return apiFetch<ProviderEventDetail>(
    `/provider/events/${encodeURIComponent(id)}`,
    { method: "PATCH", body },
  );
}

export interface ProviderTicketTypeInput {
  name: string;
  kind: "general";
  /** Lempiras. 0 is a free entry. */
  price: number;
  /** How many can be sold. */
  total: number;
  /** ISO instants. Required by the API when the price is above 0. */
  saleStartsAt: string | null;
  saleEndsAt: string | null;
  /** Lets the buyer add a contribution. Only applies to paid entries. */
  donationEnabled: boolean;
  /** Lempiras offered at checkout; null without a suggestion. */
  suggestedDonation: number | null;
  sortOrder: number;
}

/** Returns the event's ticket types after the insert, not the new row. */
export function createProviderTicketType(
  eventId: string,
  body: ProviderTicketTypeInput,
) {
  return apiFetch<ProviderTicketType[]>(
    `/provider/events/${encodeURIComponent(eventId)}/ticket-types`,
    { method: "POST", body },
  );
}

export function updateProviderTicketType(
  id: string,
  body: Partial<ProviderTicketTypeInput>,
) {
  return apiFetch<{ updated: true }>(
    `/provider/ticket-types/${encodeURIComponent(id)}`,
    { method: "PATCH", body },
  );
}

/** Soft delete on the API: the row stays, flipped to `active = false`. */
export function deleteProviderTicketType(id: string) {
  return apiFetch<{ deleted: true }>(
    `/provider/ticket-types/${encodeURIComponent(id)}`,
    { method: "DELETE" },
  );
}

export function listProviderEvents() {
  return apiFetch<ProviderEventListItem[]>("/provider/events");
}

export function getProviderEvent(id: string) {
  return apiFetch<ProviderEventDetail>(
    `/provider/events/${encodeURIComponent(id)}`,
  );
}

/** Downloads the event's settlement statement (not a fiscal invoice). */
export function downloadEventSettlement(id: string, fileName: string) {
  return downloadFile(
    `/provider/events/${encodeURIComponent(id)}/settlement.pdf`,
    fileName,
  );
}

/** Downloads the event's transactions statement as a PDF (same rows as the CSV export). */
export function downloadTransactionsStatement(id: string, fileName: string) {
  return downloadFile(
    `/provider/events/${encodeURIComponent(id)}/transactions-statement.pdf`,
    fileName,
  );
}

export interface ProviderBillingInfo {
  legalName: string | null;
  taxId: string | null;
  address: string | null;
  bankName: string | null;
  bankAccountNumber: string | null;
  bankAccountType: string | null;
}

export function getProviderBillingInfo() {
  return apiFetch<ProviderBillingInfo>("/provider/billing-info");
}

export function updateProviderBillingInfo(
  patch: Partial<ProviderBillingInfo>,
) {
  return apiFetch<ProviderBillingInfo>("/provider/billing-info", {
    method: "PATCH",
    body: patch,
  });
}

/** `date` is `YYYY-MM-DD`; omit it for today. */
export function getHourlySales(id: string, date?: string) {
  const params = new URLSearchParams({ tz: "America/Tegucigalpa" });
  if (date) params.set("date", date);
  return apiFetch<HourlySales>(
    `/provider/events/${encodeURIComponent(id)}/hourly-sales?${params.toString()}`,
  );
}

export interface ProviderEventAnswers {
  questions: Array<{ id: string; label: string }>;
  attendees: Array<{
    ticketId: string;
    code: string;
    name: string;
    createdAt: string;
    /** Keyed by question id; a question left blank is absent. */
    answers: Record<string, string>;
  }>;
}

export function getProviderEventAnswers(id: string) {
  return apiFetch<ProviderEventAnswers>(
    `/provider/events/${encodeURIComponent(id)}/answers`,
  );
}

export function getProviderPayments(id: string) {
  return apiFetch<ProviderPayments>(
    `/provider/events/${encodeURIComponent(id)}/payments`,
  );
}

export function getProviderResourceGroups(eventId: string) {
  return apiFetch<{ groups: ProviderResourceGroup[] }>(
    `/provider/events/${encodeURIComponent(eventId)}/resource-groups`,
  );
}

export function syncProviderResourceGroups(
  eventId: string,
  groups: ResourceGroupInput[],
) {
  return apiFetch<{ groups: ProviderResourceGroup[] }>(
    `/provider/events/${encodeURIComponent(eventId)}/resource-groups`,
    { method: "PUT", body: { groups } },
  );
}

export function assignProviderResource(
  eventId: string,
  resourceId: string,
  ticketId: string,
) {
  return apiFetch<{ groups: ProviderResourceGroup[] }>(
    `/provider/events/${encodeURIComponent(eventId)}/resources/${encodeURIComponent(resourceId)}/assignment`,
    { method: "POST", body: { ticketId } },
  );
}

export function releaseProviderResource(eventId: string, resourceId: string) {
  return apiFetch<{ groups: ProviderResourceGroup[] }>(
    `/provider/events/${encodeURIComponent(eventId)}/resources/${encodeURIComponent(resourceId)}/assignment`,
    { method: "DELETE" },
  );
}

/** An invite to co-host another comercio's event, as the invited side sees it. */
export interface CollaborationInvite {
  id: string;
  status: string;
  invitedAt: string;
  respondedAt: string | null;
  event: {
    id: string;
    title: string;
    startsAt: string | null;
    city: string | null;
    coverImageUrl: string | null;
    status: string;
  };
  host: CollaboratorProvider | null;
}

export interface ProviderCollaborations {
  pending: CollaborationInvite[];
  accepted: CollaborationInvite[];
}

export function listCollaborations() {
  return apiFetch<ProviderCollaborations>("/provider/collaborations");
}

export function respondCollaboration(id: string, accept: boolean) {
  return apiFetch<CollaborationInvite>(
    `/provider/collaborations/${encodeURIComponent(id)}/${accept ? "accept" : "decline"}`,
    { method: "POST" },
  );
}

export interface EventCollaborationInfo {
  access: EventAccess;
  host: CollaboratorProvider | null;
  collaborators: EventCollaborator[];
  seatsLeft: number;
}

export function getEventCollaborators(eventId: string) {
  return apiFetch<EventCollaborationInfo>(
    `/provider/events/${encodeURIComponent(eventId)}/collaborators`,
  );
}

/** Host only. `handle` is the partner comercio's public @handle. */
export function inviteEventCollaborator(eventId: string, handle: string) {
  return apiFetch<{ collaborator: EventCollaborator; emailed: number }>(
    `/provider/events/${encodeURIComponent(eventId)}/collaborators`,
    { method: "POST", body: { handle } },
  );
}

export function revokeEventCollaborator(eventId: string, providerId: string) {
  return apiFetch<EventCollaborator>(
    `/provider/events/${encodeURIComponent(eventId)}/collaborators/${encodeURIComponent(providerId)}`,
    { method: "DELETE" },
  );
}

export function listStaff() {
  return apiFetch<StaffMember[]>("/provider/staff");
}

export function inviteStaff(input: {
  email: string;
  name: string;
  role: StaffRole;
  redirectTo: string;
}) {
  return apiFetch<unknown>("/provider/staff/invite", {
    method: "POST",
    body: input,
  });
}

export function removeStaff(userId: string) {
  return apiFetch<unknown>(`/provider/staff/${encodeURIComponent(userId)}`, {
    method: "DELETE",
  });
}

/** One line of the comercio's activity feed, newest first from the API. */
export interface ProviderActivityRow {
  id: string;
  /** "sale" | "scan" | "event" | "staff" | "payout" … */
  type: string;
  message: string;
  meta: string | null;
  date: string;
}

export function listPayouts() {
  return apiFetch<ProviderPayout[]>("/provider/payouts");
}

/** Amount in lempiras. The destination bank account is agreed out of band. */
export function requestPayout(amount: number, method?: string) {
  return apiFetch<{ requested: boolean }>("/provider/payouts", {
    method: "POST",
    body: method ? { amount, method } : { amount },
  });
}

export function getProviderActivity(limit = 20) {
  return apiFetch<ProviderActivityRow[]>(`/provider/activity?limit=${limit}`);
}

export const providerKeys = {
  dashboard: ["provider", "dashboard"] as const,
  profile: ["provider", "profile"] as const,
  billingInfo: ["provider", "billing-info"] as const,
  activity: ["provider", "activity"] as const,
  payouts: ["provider", "payouts"] as const,
  events: ["provider", "events"] as const,
  event: (id: string) => ["provider", "events", id] as const,
  hourly: (id: string, date?: string) =>
    ["provider", "events", id, "hourly", date ?? "today"] as const,
  payments: (id: string) => ["provider", "events", id, "payments"] as const,
  answers: (id: string) => ["provider", "events", id, "answers"] as const,
  resources: (id: string) => ["provider", "events", id, "resources"] as const,
  staff: ["provider", "staff"] as const,
  discounts: ["provider", "discounts"] as const,
  collaborations: ["provider", "collaborations"] as const,
  collaborators: (id: string) =>
    ["provider", "events", id, "collaborators"] as const,
};
