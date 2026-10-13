import { apiFetch, isApiError } from "./client";

export type ClassPackageKind = "drop_in" | "pack" | "unlimited";

/** What cancelling gives back: `credit` returns the session to its pass, `none` never does. */
export type ClassCancellationPolicy = "none" | "credit";

export interface ClassSessionTemplate {
  id: string;
  programId: string;
  /** 0 = Sunday … 6 = Saturday. */
  weekday: number;
  /** `HH:MM`, Honduras wall clock. */
  startTime: string;
  durationMinutes: number | null;
  capacity: number | null;
  instructorName: string | null;
  active: boolean;
}

export interface ClassPackage {
  id: string;
  programId: string;
  name: string;
  /** Lempiras, not cents. */
  price: number;
  /** Null for an unlimited package. */
  credits: number | null;
  validityDays: number | null;
  kind: ClassPackageKind;
  active: boolean;
  sortOrder: number;
  /**
   * The signed-in buyer already claimed this free package. Only the
   * authenticated detail sets it; absent means unknown.
   */
  claimed?: boolean;
}

export interface ClassProgram {
  id: string;
  providerId: string;
  title: string;
  description: string | null;
  discipline: string | null;
  instructorName: string | null;
  durationMinutes: number;
  capacityPerSession: number;
  locationName: string | null;
  address: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  coverImageUrl: string | null;
  themeColor: string | null;
  status: string;
  cancellationPolicy: ClassCancellationPolicy;
  /** Hours before the session up to which cancelling still returns the credit. */
  cancellationWindowHours: number;
  sessionTemplates: ClassSessionTemplate[];
  packages: ClassPackage[];
}

/** The buyer's combined usable balance for one program. */
export interface ClassPassBalance {
  id: string;
  providerId: string;
  programId: string;
  programTitle: string;
  packageId: string | null;
  packageName: string | null;
  packageKind: ClassPackageKind | null;
  /** Null for an unlimited pass. */
  creditsTotal: number | null;
  creditsRemaining: number | null;
  validFrom: string;
  expiresAt: string | null;
  status: string;
}

export interface ClassProgramDetails extends ClassProgram {
  /** Null for a guest or a buyer with no usable pass here. */
  myBalance: ClassPassBalance | null;
}

/** Discovery row: carries its comercio so a card needs no second fetch. */
export interface ClassProgramDiscoveryItem extends ClassProgram {
  provider: {
    id: string;
    name: string;
    handle: string | null;
    logoUrl: string | null;
  } | null;
}

/** One bookable occurrence of a program on a given day. */
export interface ClassOccurrence {
  /** `YYYY-MM-DD`, the session's civil date in Honduras. */
  date: string;
  label: string;
  startTime: string;
  durationMinutes: number;
  instructorName: string | null;
  capacity: number;
  reservedCount: number;
  availableSpots: number;
  canReserve: boolean;
  alreadyReserved?: boolean;
  /** True once the session's start has passed in Honduras time. */
  elapsed?: boolean;
}

/** A confirmed booking, with the program and comercio it belongs to. */
export interface MyClassReservation {
  id: string;
  programId: string;
  programTitle: string;
  providerId: string;
  providerName: string;
  providerLogoUrl: string | null;
  city: string | null;
  locationName: string | null;
  themeColor: string | null;
  date: string;
  startTime: string;
  durationMinutes: number;
  instructorName: string | null;
  status: string;
  /** `CLS-XXXXXX`, typed by staff when the QR cannot be scanned. */
  code: string | null;
  checkedInAt: string | null;
  /** What the QR encodes. Null once checked in. */
  qrPayload: string | null;
  /** True only when a finite pass paid for it, so cancelling could return a credit. */
  refundableCredit: boolean;
  createdAt: string;
}

export interface ClassPackagePaymentResult {
  orderId: string;
  paymentLink: string;
  amountCents: number;
  currency: string;
  expiresAt: string;
  packageId: string;
  programId: string;
}

export interface ClassPackageChargeResult {
  orderId: string;
  /**
   * `paid` and `failed` are final. `pending` means the bank asked for 3DS:
   * the order settles once the cardholder finishes it.
   */
  status: "paid" | "failed" | "pending";
  redirectData?: string | null;
  /** False when the charge landed but the pass is still being created. */
  fulfilled: boolean;
  amountCents: number;
  currency: string;
  packageId: string;
  programId: string;
}

export interface ClassPackageClaimResult {
  programId: string;
  packageId: string;
  balance: ClassPassBalance | null;
}

export interface ClassReservationInput {
  programId: string;
  date: string;
  startTime: string;
}

export const classProgramKeys = {
  all: ["class-programs"] as const,
  discover: ["class-programs", "discover"] as const,
  /** Scoped by viewer: the authenticated answer carries the buyer's balance. */
  detail: (id: string, viewer: string | null) =>
    ["class-programs", id, "details", viewer ?? "guest"] as const,
  availability: (id: string, from: string, days: number, viewer: string | null) =>
    ["class-programs", id, "availability", from, days, viewer ?? "guest"] as const,
  program: (id: string) => ["class-programs", id] as const,
};

export const myClassKeys = {
  passes: ["me", "class-passes"] as const,
  reservations: ["me", "class-reservations"] as const,
  upcoming: ["me", "class-reservations", "upcoming"] as const,
};

/** Published programs across comercios, for the listing. */
export function listDiscoveryClassPrograms(limit = 30) {
  return apiFetch<ClassProgramDiscoveryItem[]>(
    `/class-programs?limit=${limit}`,
    { auth: false },
  );
}

/** Signed in, the answer carries `myBalance` and per-package `claimed`. */
export function getClassProgram(id: string, authenticated: boolean) {
  return apiFetch<ClassProgramDetails>(
    `/class-programs/${encodeURIComponent(id)}`,
    { auth: authenticated },
  );
}

export function listClassAvailability(
  id: string,
  options: { from: string; days: number; authenticated: boolean },
) {
  const params = new URLSearchParams({
    from: options.from,
    days: String(options.days),
  });
  return apiFetch<ClassOccurrence[]>(
    `/class-programs/${encodeURIComponent(id)}/availability?${params.toString()}`,
    { auth: options.authenticated },
  );
}

export function listMyClassPasses() {
  return apiFetch<ClassPassBalance[]>("/me/class-passes");
}

export function listMyUpcomingClassReservations() {
  return apiFetch<MyClassReservation[]>("/me/class-reservations?scope=upcoming");
}

/** Hosted Paygate checkout for a paid package. */
export function startClassPackagePayment(packageId: string) {
  return apiFetch<ClassPackagePaymentResult>(
    `/me/class-packages/${encodeURIComponent(packageId)}/payment`,
    { method: "POST" },
  );
}

/** Charges a card already in Paygate's vault. Only the card id travels. */
export function chargeClassPackage(packageId: string, paymentMethodId: string) {
  return apiFetch<ClassPackageChargeResult>(
    `/me/class-packages/${encodeURIComponent(packageId)}/charge`,
    { method: "POST", body: { paymentMethodId } },
  );
}

/** A zero-price package: the pass is granted at once, no checkout. */
export function claimFreeClassPackage(packageId: string) {
  return apiFetch<ClassPackageClaimResult>(
    `/me/class-packages/${encodeURIComponent(packageId)}/claim`,
    { method: "POST" },
  );
}

export function reserveClassSession(input: ClassReservationInput) {
  return apiFetch<{ id: string; status: string }>("/me/class-reservations", {
    method: "POST",
    body: input,
  });
}

/** `refunded` says whether the session credit actually went back to the pass. */
export function cancelClassReservation(id: string) {
  return apiFetch<{ id: string; status: string; refunded: boolean }>(
    `/me/class-reservations/${encodeURIComponent(id)}`,
    { method: "DELETE" },
  );
}

/**
 * The API's answer when a free package was already claimed. Holding it is
 * not something the buyer can fix, so it reads as "you already have it".
 */
const ALREADY_CLAIMED_MESSAGE = "Ya reclamaste este paquete gratis";

export function isAlreadyClaimedError(err: unknown): boolean {
  return isApiError(err) && err.message.includes(ALREADY_CLAIMED_MESSAGE);
}

/** True while the balance still has a session to spend. */
export function balanceHasSessions(balance: ClassPassBalance | null | undefined): boolean {
  return Boolean(
    balance && (balance.creditsRemaining == null || balance.creditsRemaining > 0),
  );
}
