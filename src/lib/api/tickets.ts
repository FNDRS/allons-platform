import { apiFetch } from "./client";
import type { PublicResourceGroup } from "./events";

export interface TicketEventInfo {
  id: string;
  title: string;
  startsAt: string | null;
  city: string | null;
  venue: string | null;
  address: string | null;
  themeColor: string | null;
  parkingAvailable?: boolean;
  minAge?: number | null;
  provider?: { name?: string | null; handle?: string | null } | null;
}

export interface TicketListItem {
  id: string;
  title: string;
  color: string | null;
  attendeeCount: number;
  holderName?: string | null;
  holderEmail?: string | null;
  tab: "eventos" | "clases";
  eventId?: string | null;
  event?: TicketEventInfo | null;
}

export interface TicketResourceSummary {
  id: string;
  name: string;
  required: boolean;
  assigned: { id: string; label: string } | null;
}

export interface TicketDetail extends TicketListItem {
  code: string;
  qrPayload: string;
  kitPickupInfo?: string | null;
  resourceGroups?: TicketResourceSummary[];
  refundPolicy: {
    enabled: boolean;
    deadlineHours: number;
    eligible: boolean;
    reason: string;
    refundCents?: number | null;
    currency?: string;
  };
}

export interface TicketResourceGroup extends PublicResourceGroup {
  assigned: { id: string; label: string } | null;
  resources: Array<{
    id: string;
    label: string;
    sortOrder: number;
    taken: boolean;
    mine: boolean;
  }>;
}

export interface AnswerInput {
  questionId: string;
  answer: string;
}

export interface HolderInput {
  name: string;
  email: string;
  answers: AnswerInput[];
}

export function listMyTickets() {
  return apiFetch<TicketListItem[]>("/me/tickets");
}

export function getMyTicket(id: string) {
  return apiFetch<TicketDetail>(`/me/tickets/${encodeURIComponent(id)}`);
}

export function reserveFreeTickets(input: {
  eventId: string;
  quantity: number;
  ticketTypeId?: string;
  holders: HolderInput[];
  answers: AnswerInput[];
}) {
  return apiFetch<{ createdCount: number; ticketIds: string[] }>(
    "/me/tickets",
    { method: "POST", body: input },
  );
}

export function getTicketResources(ticketId: string) {
  return apiFetch<{ groups: TicketResourceGroup[] }>(
    `/me/tickets/${encodeURIComponent(ticketId)}/resources`,
  );
}

export function assignTicketResource(ticketId: string, resourceId: string) {
  return apiFetch<{ groups: TicketResourceGroup[] }>(
    `/me/tickets/${encodeURIComponent(ticketId)}/resources`,
    { method: "POST", body: { resourceId } },
  );
}

export const ticketKeys = {
  list: ["me", "tickets"] as const,
  detail: (id: string) => ["me", "tickets", id] as const,
  resources: (id: string) => ["me", "tickets", id, "resources"] as const,
};
