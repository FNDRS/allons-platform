import { apiFetch } from "./client";

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
  };
  events: unknown[];
  payouts?: ProviderPayout[];
}

export interface ProviderEventListItem {
  id: string;
  title: string;
  startsAt: string | null;
  endsAt: string | null;
  city: string | null;
  status: string;
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
  donationEnabled: boolean;
}

export interface ProviderEventDetail extends ProviderEventListItem {
  description: string | null;
  venue: string | null;
  address: string | null;
  category?: string | null;
  ticketTypes: ProviderTicketType[];
  questions: Array<{ id: string; label: string; kind: string; required: boolean }>;
  kitPickupInfo?: string | null;
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
}

export interface ProviderPayments {
  eventId: string;
  eventTitle: string;
  summary: Record<string, unknown>;
  data: ProviderPaymentRow[];
}

export interface ProviderResource {
  id: string;
  label: string;
  sortOrder: number;
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
  resources: ProviderResource[];
}

export interface ResourceGroupInput {
  id?: string;
  name: string;
  description?: string | null;
  required?: boolean;
  columns?: number | null;
  labels: string[];
}

export type StaffRole = "scanner" | "admin";

export interface StaffMember {
  userId: string;
  role: StaffRole | string;
  name: string | null;
  email: string | null;
  phone?: string | null;
  active: boolean;
  avatarColor?: string | null;
}

export function getProviderDashboard() {
  return apiFetch<ProviderDashboard>("/provider/dashboard");
}

export function listProviderEvents() {
  return apiFetch<ProviderEventListItem[]>("/provider/events");
}

export function getProviderEvent(id: string) {
  return apiFetch<ProviderEventDetail>(
    `/provider/events/${encodeURIComponent(id)}`,
  );
}

export function getHourlySales(id: string) {
  return apiFetch<HourlySales>(
    `/provider/events/${encodeURIComponent(id)}/hourly-sales?tz=${encodeURIComponent("America/Tegucigalpa")}`,
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
  activity: ["provider", "activity"] as const,
  payouts: ["provider", "payouts"] as const,
  events: ["provider", "events"] as const,
  event: (id: string) => ["provider", "events", id] as const,
  hourly: (id: string) => ["provider", "events", id, "hourly"] as const,
  payments: (id: string) => ["provider", "events", id, "payments"] as const,
  resources: (id: string) => ["provider", "events", id, "resources"] as const,
  staff: ["provider", "staff"] as const,
};
