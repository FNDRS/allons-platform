import { apiFetch } from "./client";

/**
 * Door check-in, the same two steps the app's scanner runs: `preview` reads
 * the ticket without touching it, `confirm` writes the entry. Both accept
 * whatever the attendee shows: the QR payload, the bare ticket id or the
 * printed `ALL-XXXXXX` code.
 */

export type ScanStatus = "valid" | "duplicate" | "invalid" | "wrong_event" | "cancelled";
export type ScanPreviewStatus = "ready" | "duplicate" | "invalid" | "wrong_event" | "cancelled";

export interface ScanPreviousScan {
  scannedAt: string;
  scannedByName: string;
  status: ScanStatus;
}

export interface ScanPreviewResult {
  status: ScanPreviewStatus;
  ticketId?: string;
  attendeeName: string;
  ticketCode: string;
  ticketTitle: string;
  ticketType: string;
  attendeeCount: number;
  eventId: string;
  eventTitle: string;
  verified: boolean;
  previousScan?: ScanPreviousScan;
}

export interface ScanConfirmResult {
  status: ScanStatus;
  ticketId: string;
  attendeeName: string;
  ticketCode: string;
  eventId: string;
  ticketTitle: string;
  ticketType: string;
  attendeeCount: number;
  previousScan?: ScanPreviousScan;
}

export interface ProviderScanRecord {
  id: string;
  eventId: string;
  eventTitle: string;
  ticketCode: string;
  attendeeName: string;
  ticketType: string;
  scannedBy: string;
  status: ScanStatus;
  scannedAt: string;
}

export type ClassScanStatus = "valid" | "duplicate" | "cancelled" | "wrong_day" | "invalid";

export interface ClassScanResult {
  status: ClassScanStatus;
  verified: boolean;
  reservationId?: string;
  programId?: string;
  programTitle?: string;
  date?: string;
  startTime?: string;
  code?: string | null;
  holderName?: string | null;
  checkedInAt?: string;
}

/** An event a scanner-only staff member can work the door of. */
export interface StaffScanTarget {
  kind: "event" | "class";
  id: string;
  title: string;
  startsAt: string | null;
  venue: string | null;
  city: string | null;
  themeColor: string | null;
  coverImageUrl: string | null;
  status: string;
  capacity: number;
  ticketsSold: number;
  scans: number;
}

export function previewScan(input: { eventId: string; ticketCode: string }) {
  return apiFetch<ScanPreviewResult>("/provider/scans/preview", {
    method: "POST",
    body: input,
  });
}

export function confirmScan(input: { eventId: string; ticketId: string }) {
  return apiFetch<ScanConfirmResult>("/provider/scans/confirm", {
    method: "POST",
    body: input,
  });
}

/** Class reservations check in on one call: there is no review step. */
export function checkInClassScan(code: string) {
  return apiFetch<ClassScanResult>("/provider/class-scans", {
    method: "POST",
    body: { code },
  });
}

export function listScans(eventId: string) {
  return apiFetch<ProviderScanRecord[]>(
    `/provider/scans?eventId=${encodeURIComponent(eventId)}`,
  );
}

export function listStaffScanTargets() {
  return apiFetch<StaffScanTarget[]>("/staff/scan-targets");
}

export const scanKeys = {
  targets: ["scanner", "targets"] as const,
  records: (eventId: string) => ["scanner", "records", eventId] as const,
};

const CLASS_CODE = /^CLS-?[0-9A-Z]{6}$/i;

/**
 * Class reservations and event tickets never share a payload: a class QR is
 * `{c,p,ts,s}`, a ticket `{t,e,ts,s}`, and the codes start with `CLS-` and
 * `ALL-`. A bare UUID stays an event ticket, since that is what the door
 * picked an event for. The server still checks every signature.
 */
export function looksLikeClassScan(raw: string): boolean {
  const trimmed = raw.trim();
  if (!trimmed) return false;
  if (CLASS_CODE.test(trimmed.replace(/\s/g, ""))) return true;
  try {
    const parsed: unknown = JSON.parse(trimmed);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return false;
    const obj = parsed as Record<string, unknown>;
    return typeof obj.c === "string" && typeof obj.t !== "string";
  } catch {
    return false;
  }
}
