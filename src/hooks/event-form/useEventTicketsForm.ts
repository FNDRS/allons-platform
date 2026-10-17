"use client";

import { useState } from "react";
import type { ProviderTicketType, ProviderTicketTypeInput } from "@/lib/api/provider";
import { useDraftPersistence } from "@/hooks/class-program-form/useDraftPersistence";
import { endOfHnDay, hnToIso, isoToHn } from "./time";

/** A ticket type being authored. `id` is local until the API assigns one. */
export interface EventTicketDraft {
  id: string;
  name: string;
  /** Lempiras as typed. Empty or 0 is a free entry. */
  price: string;
  /** How many can be sold, as typed. */
  total: string;
  /** Already sold on the server, so the quantity cannot drop below it. */
  sold: number;
  /** Optional sale window in Honduras time. Blank uses the defaults. */
  saleStartDate: string;
  saleStartTime: string;
  saleEndDate: string;
  saleEndTime: string;
}

let draftSeq = 0;
const nextDraftId = () => `ticket-draft-${++draftSeq}`;

function emptyDraft(isFirst: boolean): EventTicketDraft {
  return {
    id: nextDraftId(),
    name: isFirst ? "General" : "",
    price: "",
    total: "",
    sold: 0,
    saleStartDate: "",
    saleStartTime: "",
    saleEndDate: "",
    saleEndTime: "",
  };
}

function fromTicketType(item: ProviderTicketType): EventTicketDraft {
  const start = isoToHn(item.saleStartsAt);
  const end = isoToHn(item.saleEndsAt);
  return {
    id: item.id,
    name: item.name,
    price: item.price > 0 ? String(item.price) : "",
    total: item.total > 0 ? String(item.total) : "",
    sold: item.sold,
    saleStartDate: start.date,
    saleStartTime: start.time,
    saleEndDate: end.date,
    saleEndTime: end.time,
  };
}

export const ticketPrice = (draft: EventTicketDraft) => Number(draft.price) || 0;

/** Both halves of one side of the window, or neither. */
function sideError(date: string, time: string, label: string): string | null {
  if (Boolean(date) !== Boolean(time)) return `Completa la fecha y la hora de ${label}.`;
  return null;
}

/** Why a draft cannot be saved yet, or null. Mirrors the API rules. */
export function eventTicketDraftError(draft: EventTicketDraft): string | null {
  if (!draft.name.trim()) return "Ponle un nombre a la entrada.";
  const price = Number(draft.price || 0);
  if (!Number.isFinite(price) || price < 0) return "Revisa el precio.";
  const total = Number(draft.total);
  if (!Number.isInteger(total) || total <= 0) return "Indica cuántas entradas hay a la venta.";
  if (total < draft.sold) {
    return `Ya vendiste ${draft.sold}, así que la cantidad no puede ser menor.`;
  }
  if (price > 0) {
    const startErr = sideError(draft.saleStartDate, draft.saleStartTime, "inicio de venta");
    if (startErr) return startErr;
    const endErr = sideError(draft.saleEndDate, draft.saleEndTime, "fin de venta");
    if (endErr) return endErr;
    const start = hnToIso(draft.saleStartDate, draft.saleStartTime);
    const end = hnToIso(draft.saleEndDate, draft.saleEndTime);
    if (start && end && start >= end) return "La venta debe empezar antes de terminar.";
  }
  return null;
}

/**
 * The sale window the API gets for a paid entry: what the comercio typed,
 * or from now until the event starts. Free entries have no window.
 */
function resolveSaleWindow(
  draft: EventTicketDraft,
  eventStartsAt: string | null,
): { saleStartsAt: string | null; saleEndsAt: string | null } {
  if (ticketPrice(draft) <= 0) return { saleStartsAt: null, saleEndsAt: null };
  return {
    saleStartsAt:
      hnToIso(draft.saleStartDate, draft.saleStartTime) ?? new Date().toISOString(),
    saleEndsAt: hnToIso(draft.saleEndDate, draft.saleEndTime) ?? eventStartsAt,
  };
}

/**
 * Problems a draft only has against the event's date, which the modal does
 * not know: the API refuses a paid window that runs past the event's day.
 */
export function ticketWindowProblem(
  draft: EventTicketDraft,
  eventDate: string,
  eventStartsAt: string | null,
): string | null {
  if (ticketPrice(draft) <= 0) return null;
  const { saleStartsAt, saleEndsAt } = resolveSaleWindow(draft, eventStartsAt);
  const name = draft.name.trim() || "una entrada";
  if (!saleEndsAt) return `la fecha del evento para vender "${name}"`;
  if (saleStartsAt && saleStartsAt >= saleEndsAt) {
    return `una venta de "${name}" que empiece antes de terminar`;
  }
  const dayEnd = endOfHnDay(eventDate);
  if (dayEnd !== null && new Date(saleEndsAt).getTime() >= dayEnd) {
    return `que la venta de "${name}" termine a más tardar el día del evento`;
  }
  return null;
}

/** Ticket types (entradas) of an event, edited in a modal. */
export function useEventTicketsForm(initial: ProviderTicketType[] = []) {
  const [tickets, setTickets] = useState<EventTicketDraft[]>(() => initial.map(fromTicketType));
  const [editorDraft, setEditorDraft] = useState<EventTicketDraft | null>(null);
  const persistence = useDraftPersistence(
    initial.map((item) => item.id),
    setTickets,
  );

  const editorError = editorDraft ? eventTicketDraftError(editorDraft) : null;

  const toPayload =
    (eventStartsAt: string | null) =>
    (draft: EventTicketDraft, sortOrder: number): ProviderTicketTypeInput => ({
      name: draft.name.trim(),
      kind: "general",
      price: ticketPrice(draft),
      total: Number(draft.total),
      ...resolveSaleWindow(draft, eventStartsAt),
      sortOrder,
    });

  return {
    tickets,
    hasTickets: tickets.length > 0,
    hasPaidTickets: tickets.some((draft) => ticketPrice(draft) > 0),
    capacityFromTickets: tickets.reduce((sum, draft) => sum + (Number(draft.total) || 0), 0),
    editorDraft,
    editorError,
    openNew: () => setEditorDraft(emptyDraft(tickets.length === 0)),
    openExisting: (id: string) => {
      const found = tickets.find((item) => item.id === id);
      if (found) setEditorDraft({ ...found });
    },
    closeEditor: () => setEditorDraft(null),
    updateEditor: (patch: Partial<EventTicketDraft>) =>
      setEditorDraft((current) => (current ? { ...current, ...patch } : current)),
    commitEditor: () => {
      if (!editorDraft || editorError) return;
      setTickets((current) =>
        current.some((item) => item.id === editorDraft.id)
          ? current.map((item) => (item.id === editorDraft.id ? editorDraft : item))
          : [...current, editorDraft],
      );
      setEditorDraft(null);
    },
    /** Entries with sales stay: removing them would orphan the tickets sold. */
    remove: (id: string) =>
      setTickets((current) => current.filter((item) => item.id !== id || item.sold > 0)),
    windowProblems: (eventDate: string, eventStartsAt: string | null) =>
      tickets
        .map((draft) => ticketWindowProblem(draft, eventDate, eventStartsAt))
        .filter((problem): problem is string => problem !== null),
    toDiff: (eventStartsAt: string | null) =>
      persistence.diff(tickets, toPayload(eventStartsAt)),
    /** Ids of the drafts that already exist on the server. */
    persistedIds: persistence.diff(tickets, () => null).update.map(({ id }) => id),
    markPersisted: persistence.markPersisted,
    markDeleted: persistence.markDeleted,
  };
}
