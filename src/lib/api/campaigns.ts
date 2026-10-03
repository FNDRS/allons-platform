import { apiFetch, downloadFile } from "./client";
import type { EventListItem, EventQuestionKind } from "./events";

/** A published campaign as anyone sees it on allonsapp.com/campanas/<slug>. */
export interface PublicCampaign {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  coverImageUrl: string | null;
  startsAt: string;
  endsAt: string;
  hub: { id: string; name: string; handle: string | null; logoUrl: string | null };
}

export const campaignKeys = {
  events: (slug: string) => ["campaigns", slug, "events"] as const,
  access: ["provider", "me"] as const,
  hubList: ["provider", "hub-campaigns"] as const,
  hub: (id: string) => ["provider", "hub-campaigns", id] as const,
  comercioList: ["provider", "campaigns"] as const,
  comercio: (id: string) => ["provider", "campaigns", id] as const,
};

/** The campaign's live public events, same cards as the main listing. */
export function listCampaignEvents(slug: string) {
  return apiFetch<EventListItem[]>(
    `/events?campaign=${encodeURIComponent(slug)}`,
    { auth: false },
  );
}

// ---- Comercio panel: hub and member sides -------------------------------

export type CampaignStatus = "draft" | "published" | "archived";
export type CampaignMemberStatus = "pending" | "accepted" | "declined" | "revoked" | "left";

export interface CampaignProvider {
  id: string;
  name: string;
  handle: string | null;
  logoUrl: string | null;
}

export interface CampaignQuestion {
  id: string;
  label: string;
  kind: EventQuestionKind;
  options: string[] | null;
  requiredForComercio: boolean;
  requiredForAttendee: boolean;
  sortOrder: number;
}

export interface CampaignQuestionInput {
  id?: string;
  label: string;
  kind: EventQuestionKind;
  options?: string[];
  requiredForComercio: boolean;
  requiredForAttendee: boolean;
  sortOrder?: number;
}

export interface CampaignInput {
  name: string;
  description?: string;
  startsAt: string;
  endsAt: string;
  status?: CampaignStatus;
  questions?: CampaignQuestionInput[];
}

export interface HubCampaignListItem {
  id: string;
  slug: string;
  name: string;
  startsAt: string;
  endsAt: string;
  status: CampaignStatus;
  memberCount: number;
  pendingCount: number;
  eventCount: number;
}

export interface HubCampaign {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  startsAt: string;
  endsAt: string;
  status: CampaignStatus;
  questions: CampaignQuestion[];
}

export interface HubCampaignMember {
  id: string;
  status: CampaignMemberStatus;
  initiatedBy: "hub" | "comercio";
  provider: CampaignProvider;
  eventCount: number;
}

export interface CampaignEventRow {
  id: string;
  title: string;
  startsAt: string | null;
  city: string | null;
  provider?: CampaignProvider | null;
}

export interface CampaignReport {
  totals: {
    events: number;
    removedEvents: number;
    comercios: number;
    registered: number;
    attended: number;
    attendanceRate: number;
  };
  byComercio: {
    providerId: string;
    name: string;
    events: number;
    registered: number;
    attended: number;
    attendanceRate: number;
  }[];
  byEvent: {
    eventId: string;
    title: string;
    providerName: string;
    removedAt: string | null;
    registered: number;
    attended: number;
    attendanceRate: number;
  }[];
  questions: {
    id: string;
    label: string;
    answered: number;
    options?: { option: string; count: number }[];
    numeric?: { average: number; min: number; max: number };
  }[];
}

export interface CampaignMembership {
  id: string;
  status: CampaignMemberStatus;
  initiatedBy: "hub" | "comercio";
}

export interface ComercioCampaignListItem {
  id: string;
  slug: string;
  name: string;
  status: CampaignStatus;
  startsAt: string;
  endsAt: string;
  hub: CampaignProvider;
  membership: CampaignMembership | null;
}

export interface ComercioCampaign {
  id: string;
  name: string;
  description?: string | null;
  status: CampaignStatus;
  startsAt: string;
  endsAt: string;
  hub: CampaignProvider;
  questions: CampaignQuestion[];
  membership: (CampaignMembership & { optionalQuestionIds: string[] }) | null;
  events: CampaignEventRow[];
  availableEvents: CampaignEventRow[];
}

export interface ProviderAccess {
  providerId: string;
  role: string;
  isCampaignHub?: boolean;
}

const hub = (id = "") => `/provider/hub/campaigns${id ? `/${encodeURIComponent(id)}` : ""}`;
const mine = (id = "") => `/provider/campaigns${id ? `/${encodeURIComponent(id)}` : ""}`;

export const getProviderAccess = () => apiFetch<ProviderAccess>("/provider/me");

export const listHubCampaigns = () => apiFetch<HubCampaignListItem[]>(hub());
export const getHubCampaign = (id: string) => apiFetch<HubCampaign>(hub(id));
export const createHubCampaign = (body: CampaignInput) =>
  apiFetch<HubCampaign>(hub(), { method: "POST", body });
export const updateHubCampaign = (id: string, body: Partial<CampaignInput>) =>
  apiFetch<HubCampaign>(hub(id), { method: "PATCH", body });
export const deleteHubCampaign = (id: string) =>
  apiFetch<{ ok: true }>(hub(id), { method: "DELETE" });
export const listHubCampaignMembers = (id: string) =>
  apiFetch<HubCampaignMember[]>(`${hub(id)}/members`);
export const inviteToHubCampaign = (id: string, handle: string) =>
  apiFetch(`${hub(id)}/members`, { method: "POST", body: { handle } });
export const answerHubCampaignRequest = (id: string, memberId: string, approve: boolean) =>
  apiFetch(`${hub(id)}/members/${encodeURIComponent(memberId)}/${approve ? "approve" : "decline"}`, {
    method: "POST",
  });
export const removeHubCampaignMember = (id: string, memberId: string) =>
  apiFetch(`${hub(id)}/members/${encodeURIComponent(memberId)}`, { method: "DELETE" });
export const listHubCampaignEvents = (id: string) =>
  apiFetch<CampaignEventRow[]>(`${hub(id)}/events`);
export const removeHubCampaignEvent = (id: string, eventId: string) =>
  apiFetch(`${hub(id)}/events/${encodeURIComponent(eventId)}`, { method: "DELETE" });
export const getHubCampaignReport = (id: string) =>
  apiFetch<CampaignReport>(`${hub(id)}/report`);
export const downloadHubCampaignReport = (id: string, format: "pdf" | "csv", name: string) =>
  downloadFile(`${hub(id)}/report.${format}`, `${name}.${format}`);

export const listComercioCampaigns = () => apiFetch<ComercioCampaignListItem[]>(mine());
export const getComercioCampaign = (id: string) => apiFetch<ComercioCampaign>(mine(id));
export const requestToJoinCampaign = (id: string, optionalQuestionIds: string[]) =>
  apiFetch(`${mine(id)}/request`, { method: "POST", body: { optionalQuestionIds } });
export const answerCampaignInvite = (memberId: string, accept: boolean, optionalQuestionIds: string[]) =>
  apiFetch(`/provider/campaigns/memberships/${encodeURIComponent(memberId)}/${accept ? "accept" : "decline"}`, {
    method: "POST",
    body: accept ? { optionalQuestionIds } : {},
  });
export const leaveCampaign = (id: string) => apiFetch(`${mine(id)}/leave`, { method: "POST" });
export const updateCampaignSharing = (id: string, optionalQuestionIds: string[]) =>
  apiFetch(`${mine(id)}/sharing`, { method: "PUT", body: { optionalQuestionIds } });
export const addEventToCampaign = (id: string, eventId: string) =>
  apiFetch(`${mine(id)}/events`, { method: "POST", body: { eventId } });
export const removeEventFromCampaign = (id: string, eventId: string) =>
  apiFetch(`${mine(id)}/events/${encodeURIComponent(eventId)}`, { method: "DELETE" });

export interface CampaignAttendee {
  eventId: string;
  eventTitle: string;
  providerName: string;
  registeredAt: string;
  /** The holder's name with consent, otherwise "Anónimo". */
  name: string;
  consented: boolean;
  attended: boolean;
  /** Keyed by campaign question id; empty without consent. */
  answers: Record<string, string>;
}

export interface CampaignAttendeeList {
  questions: { id: string; label: string }[];
  attendees: CampaignAttendee[];
}

export const getHubCampaignAttendees = (id: string, eventId?: string) =>
  apiFetch<CampaignAttendeeList>(
    `${hub(id)}/attendees${eventId ? `?eventId=${encodeURIComponent(eventId)}` : ""}`,
  );
