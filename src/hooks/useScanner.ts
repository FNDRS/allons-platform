"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/app/AuthProvider";
import { isApiError } from "@/lib/api/client";
import { listProviderEvents, providerKeys } from "@/lib/api/provider";
import {
  checkInClassScan,
  confirmScan,
  listScans,
  listStaffScanTargets,
  looksLikeClassScan,
  previewScan,
  scanKeys,
  type ClassScanResult,
  type ScanConfirmResult,
  type ScanPreviewResult,
} from "@/lib/api/scans";
import { isScannerOnlyUser } from "@/lib/role";

/** Events whose door can still open. Drafts and events under review cannot sell. */
const SCANNABLE = new Set(["published", "sold_out", "ended"]);
const STORAGE_KEY = "allons:scanner-event";

export interface ScanEvent {
  id: string;
  title: string;
  startsAt: string | null;
  ticketsSold: number;
  scans: number;
}

export type ScanOutcome =
  | { kind: "preview"; result: ScanPreviewResult }
  | { kind: "confirmed"; result: ScanConfirmResult }
  | { kind: "class"; result: ClassScanResult }
  | { kind: "needs-event" }
  | { kind: "blocked"; title: string; message: string }
  | { kind: "error"; message: string };

/** Closest to today first: tonight's event before last month's. */
function byDistanceToNow(a: ScanEvent, b: ScanEvent) {
  const now = Date.now();
  const distance = (event: ScanEvent) =>
    event.startsAt ? Math.abs(new Date(event.startsAt).getTime() - now) : Infinity;
  return distance(a) - distance(b);
}

function readStoredEvent(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function storeEvent(id: string) {
  try {
    window.localStorage.setItem(STORAGE_KEY, id);
  } catch {
    // Private windows can refuse storage; the picker still works.
  }
}

/**
 * A revoked member or staff without a comercio is not a bad ticket: say so,
 * the same way the app's scanner does, instead of "Ticket inválido".
 */
function blockedFrom(error: unknown): ScanOutcome | null {
  if (!isApiError(error)) return null;
  const code = error.code?.toLowerCase();
  if (code === "comercio_member_disabled") {
    return {
      kind: "blocked",
      title: "Cuenta desactivada",
      message: "El comercio desactivó tu acceso. Pide que te vuelvan a invitar.",
    };
  }
  if (code === "staff_without_comercio") {
    return {
      kind: "blocked",
      title: "Sin comercio asignado",
      message: "Tu cuenta no pertenece a ningún comercio todavía.",
    };
  }
  return null;
}

function errorOutcome(error: unknown): ScanOutcome {
  return (
    blockedFrom(error) ?? {
      kind: "error",
      message: isApiError(error) ? error.message : "No pudimos validar el código.",
    }
  );
}

/**
 * The door: which event is open, what the last code returned, and the
 * preview, confirm and reset steps. Owners and admins pick from their
 * events; door staff from the targets the API gives them.
 */
export function useScanner() {
  const client = useQueryClient();
  const { user } = useAuth();
  const scannerOnly = isScannerOnlyUser(user);

  const eventsQuery = useQuery({
    queryKey: scannerOnly ? scanKeys.targets : providerKeys.events,
    queryFn: async (): Promise<(ScanEvent & { status: string })[]> => {
      if (scannerOnly) {
        const targets = await listStaffScanTargets();
        return targets.filter((target) => target.kind === "event");
      }
      return listProviderEvents();
    },
    select: (events) =>
      events
        .filter((event) => SCANNABLE.has(event.status))
        .map(({ id, title, startsAt, ticketsSold, scans }) => ({
          id,
          title,
          startsAt,
          ticketsSold,
          scans,
        }))
        .sort(byDistanceToNow),
  });
  const events = useMemo(() => eventsQuery.data ?? [], [eventsQuery.data]);

  const [picked, setPicked] = useState<string | null>(null);
  useEffect(() => {
    if (picked || events.length === 0) return;
    const stored = readStoredEvent();
    setPicked(events.some((event) => event.id === stored) ? stored : events[0].id);
  }, [events, picked]);
  const event = events.find((item) => item.id === picked) ?? null;

  const selectEvent = (id: string) => {
    setPicked(id);
    storeEvent(id);
    setOutcome(null);
  };

  const records = useQuery({
    queryKey: scanKeys.records(event?.id ?? ""),
    queryFn: () => listScans(event!.id),
    enabled: Boolean(event),
  });

  const [outcome, setOutcome] = useState<ScanOutcome | null>(null);

  const refresh = () => {
    void client.invalidateQueries({ queryKey: ["scanner"] });
    void client.invalidateQueries({ queryKey: providerKeys.events });
    void client.invalidateQueries({ queryKey: providerKeys.dashboard });
  };

  const lookup = useMutation({
    mutationFn: async ({
      raw,
      eventId,
    }: {
      raw: string;
      eventId: string | null;
    }): Promise<ScanOutcome> => {
      if (looksLikeClassScan(raw)) {
        return { kind: "class", result: await checkInClassScan(raw.trim()) };
      }
      if (!eventId) return { kind: "needs-event" };
      return {
        kind: "preview",
        result: await previewScan({ eventId, ticketCode: raw.trim() }),
      };
    },
    onSuccess: (next) => {
      setOutcome(next);
      if (next.kind === "class" && next.result.status === "valid") refresh();
    },
    onError: (error) => setOutcome(errorOutcome(error)),
  });

  const confirm = useMutation({
    mutationFn: (input: { eventId: string; ticketId: string }) => confirmScan(input),
    onSuccess: (result) => {
      setOutcome({ kind: "confirmed", result });
      refresh();
    },
    onError: (error) => setOutcome(errorOutcome(error)),
  });

  const submit = (raw: string) => {
    if (!raw.trim() || lookup.isPending || confirm.isPending) return;
    lookup.mutate({ raw, eventId: event?.id ?? null });
  };

  /** A ticket for another event this door can open: move there and read it again. */
  const switchAndRetry = (eventId: string, raw: string) => {
    setPicked(eventId);
    storeEvent(eventId);
    lookup.mutate({ raw, eventId });
  };

  const confirmEntry = () => {
    if (outcome?.kind !== "preview" || outcome.result.status !== "ready") return;
    const { ticketId, eventId } = outcome.result;
    if (!ticketId) return;
    confirm.mutate({ eventId, ticketId });
  };

  return {
    events,
    eventsLoading: eventsQuery.isLoading,
    eventsError: eventsQuery.error as Error | null,
    refetchEvents: eventsQuery.refetch,
    event,
    selectEvent,
    records: records.data ?? [],
    recordsLoading: records.isLoading,
    outcome,
    busy: lookup.isPending || confirm.isPending,
    checking: lookup.isPending,
    confirming: confirm.isPending,
    submit,
    switchAndRetry,
    confirmEntry,
    reset: () => setOutcome(null),
  };
}
