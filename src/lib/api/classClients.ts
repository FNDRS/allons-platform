import { apiFetch } from "./client";
import type { CatalogPackageKind } from "./classCatalog";

export type ClassMembershipStatus = "active" | "past_due" | "cancelled" | "completed";

export interface ClassMembership {
  id: string;
  providerId: string;
  providerName: string;
  providerLogoUrl: string | null;
  packageId: string;
  packageName: string;
  benefits: string[];
  dailyLimit: number | null;
  status: ClassMembershipStatus;
  /** Grants access right now. */
  live: boolean;
  installmentsTotal: number;
  installmentsPaid: number;
  installmentCents: number;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  nextChargeAt: string | null;
  lastChargeError: string | null;
  hasCard: boolean;
  guestPasses: { perMonth: number; usedThisMonth: number; canInvite: boolean };
  createdAt: string;
}

export interface ClassGuestPass {
  id: string;
  membershipId: string;
  providerId: string;
  providerName: string;
  hostName: string;
  guestName: string | null;
  /** `YYYY-MM-01`. */
  periodMonth: string;
  code: string;
  status: "pending" | "redeemed" | "revoked";
  expiresAt: string;
  redeemedAt: string | null;
  createdAt: string;
}

export interface ClassClient {
  userId: string;
  name: string;
  avatarUrl: string | null;
  avatarColor: string | null;
  creditsRemaining: number;
  hasUnlimited: boolean;
  membership: { name: string; status: ClassMembershipStatus; periodEnd: string | null } | null;
  classesAttended: number;
  classesBooked: number;
  upcoming: number;
  lastVisitAt: string | null;
  spentCents: number;
  firstSeenAt: string;
}

export type ClassPassSource = "purchase" | "free" | "guest" | "membership";

export interface ClassClientPass {
  id: string;
  /** Null on a guest pass, which has no package. */
  packageName: string | null;
  packageKind: CatalogPackageKind | null;
  /** Null when the pass works across the comercio. */
  programTitle: string | null;
  source: ClassPassSource;
  creditsTotal: number | null;
  creditsRemaining: number | null;
  used: number;
  validFrom: string | null;
  expiresAt: string | null;
  active: boolean;
}

export interface ClassClientReservation {
  id: string;
  programTitle: string;
  date: string;
  startTime: string;
  instructorName: string | null;
  status: "reserved" | "cancelled";
  checkedInAt: string | null;
  code: string;
}

export interface ClassClientDetail extends ClassClient {
  email: string | null;
  phone: string | null;
  passes: ClassClientPass[];
  reservations: ClassClientReservation[];
  memberships: ClassMembership[];
  guestPasses: ClassGuestPass[];
}

export const classClientKeys = {
  all: ["provider", "class-clients"] as const,
  list: (q: string) => ["provider", "class-clients", "list", q] as const,
  detail: (userId: string) => ["provider", "class-clients", "detail", userId] as const,
};

const base = "/provider/class-clients";

export const listClassClients = (q: string) =>
  apiFetch<ClassClient[]>(q ? `${base}?${new URLSearchParams({ q })}` : base);

export const getClassClient = (userId: string) =>
  apiFetch<ClassClientDetail>(`${base}/${encodeURIComponent(userId)}`);

/** Stops future installments; the paid period keeps running. */
export const cancelClassMembership = (membershipId: string) =>
  apiFetch<unknown>(
    `/provider/class-memberships/${encodeURIComponent(membershipId)}/cancel`,
    { method: "POST" },
  );
