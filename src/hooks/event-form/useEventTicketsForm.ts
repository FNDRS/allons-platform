"use client";

import { useState } from "react";
import type { ProviderTicketType, ProviderTicketTypeInput } from "@/lib/api/provider";
import { useDraftPersistence } from "@/hooks/class-program-form/useDraftPersistence";
import { endOfHnDay, hnToIso, isoToHn, nowHnRounded } from "./time";

/** Same cap the API puts on a suggested contribution: L 100,000. */
export const MAX_SUGGESTED_DONATION = 100_000;

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
  /** When a paid entry starts selling, in Honduras time. */
  saleStartDate: string;
  saleStartTime: string;
  /** When it stops selling, unless `saleEndFollowsEvent`. */
  saleEndDate: string;
  saleEndTime: string;
  /**
   * The sale ends when the event starts, and moves with it. The default, so a
   * later change of the event's date does not leave the sale behind.
   */
  saleEndFollowsEvent: boolean;
  /** Buyers can add a contribution on top of the price (paid entries only). */
  donationEnabled: boolean;
  /** Suggested contribution in lempiras, as typed. Empty is no suggestion. */
  suggestedDonation: string;
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
    saleEndFollowsEvent: true,
    donationEnabled: false,
    suggestedDonation: "",
  };
}

const sameInstant = (a: string | null, b: string | null) =>
  Boolean(a && b) && new Date(a as string).getTime() === new Date(b as string).getTime();

function fromTicketType(item: ProviderTicketType, eventStartsAt: string | null): EventTicketDraft {
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
    saleEndFollowsEvent: !item.saleEndsAt || sameInstant(item.saleEndsAt, eventStartsAt),
    donationEnabled: item.donationEnabled,
    suggestedDonation: item.suggestedDonation ? String(item.suggestedDonation) : "",
  };
}

/**
 * Fills the sale start of a paid entry that has none with the current time,
 * so the modal shows the real window instead of blanks.
 */
function withDefaultStart(draft: EventTicketDraft): EventTicketDraft {
  if (ticketPrice(draft) <= 0 || draft.saleStartDate || draft.saleStartTime) return draft;
  const now = nowHnRounded();
  return { ...draft, saleStartDate: now.date, saleStartTime: now.time };
}

/** The suggested contribution in lempiras, or an error. Empty or 0 is none. */
export function parseSuggestedDonation(raw: string): { value: number | null; error: string | null } {
  const text = raw.trim();
  if (!text) return { value: null, error: null };
  const value = Number(text);
  if (!Number.isFinite(value) || value < 0) {
    return { value: null, error: "Revisa la donación sugerida." };
  }
  if (value > MAX_SUGGESTED_DONATION) {
    return { value: null, error: "La donación sugerida no puede pasar de L 100,000." };
  }
  const rounded = Math.round(value * 100) / 100;
  return { value: rounded > 0 ? rounded : null, error: null };
}

export const ticketPrice = (draft: EventTicketDraft) => Number(draft.price) || 0;

/** Both halves of one side of the window, or neither. */
function sideError(date: string, time: string, label: string): string | null {
  if (Boolean(date) !== Boolean(time)) return `Completa la fecha y la hora de ${label}.`;
  return null;
}

/** End of the sale as the comercio sees it: typed, or the event's start. */
export function saleEnd(
  draft: EventTicketDraft,
  eventStartsAt: string | null,
): { date: string; time: string } {
  return draft.saleEndFollowsEvent
    ? isoToHn(eventStartsAt)
    : { date: draft.saleEndDate, time: draft.saleEndTime };
}

/** Why a draft cannot be saved yet, or null. Mirrors the API rules. */
export function eventTicketDraftError(
  draft: EventTicketDraft,
  eventStartsAt: string | null,
): string | null {
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
    if (!draft.saleEndFollowsEvent) {
      if (!draft.saleEndDate || !draft.saleEndTime) {
        return "Completa la fecha y la hora en que termina la venta.";
      }
    }
    const end = saleEnd(draft, eventStartsAt);
    const start = hnToIso(draft.saleStartDate, draft.saleStartTime);
    const endIso = hnToIso(end.date, end.time);
    if (start && endIso && start >= endIso) return "La venta tiene que empezar antes de terminar.";
    const eventDate = isoToHn(eventStartsAt).date;
    const dayEnd = eventDate ? endOfHnDay(eventDate) : null;
    if (endIso && dayEnd !== null && new Date(endIso).getTime() >= dayEnd) {
      return "La venta tiene que terminar a más tardar el día del evento.";
    }
    if (draft.donationEnabled) {
      const suggestion = parseSuggestedDonation(draft.suggestedDonation);
      if (suggestion.error) return suggestion.error;
    }
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
    saleEndsAt: draft.saleEndFollowsEvent
      ? eventStartsAt
      : (hnToIso(draft.saleEndDate, draft.saleEndTime) ?? eventStartsAt),
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

/**
 * Ticket types (entradas) of an event, edited in a modal. `eventStartsAt` is
 * the event's start as currently typed; on the first render it is the stored
 * one, which tells which saved sales end with the event.
 */
export function useEventTicketsForm(
  initial: ProviderTicketType[] = [],
  eventStartsAt: string | null = null,
) {
  const [tickets, setTickets] = useState<EventTicketDraft[]>(() =>
    initial.map((item) => fromTicketType(item, eventStartsAt)),
  );
  const [editorDraft, setEditorDraft] = useState<EventTicketDraft | null>(null);
  const persistence = useDraftPersistence(
    initial.map((item) => item.id),
    setTickets,
  );

  const editorError = editorDraft ? eventTicketDraftError(editorDraft, eventStartsAt) : null;

  const toPayload =
    (eventStartsAt: string | null) =>
    (draft: EventTicketDraft, sortOrder: number): ProviderTicketTypeInput => {
      // Contributions only apply to paid entries; checkout refuses them on
      // free ones, so a free entry always sends them off.
      const takesDonations = ticketPrice(draft) > 0 && draft.donationEnabled;
      return {
        name: draft.name.trim(),
        kind: "general",
        price: ticketPrice(draft),
        total: Number(draft.total),
        ...resolveSaleWindow(draft, eventStartsAt),
        donationEnabled: takesDonations,
        suggestedDonation: takesDonations
          ? parseSuggestedDonation(draft.suggestedDonation).value
          : null,
        sortOrder,
      };
    };

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
      if (found) setEditorDraft(withDefaultStart({ ...found }));
    },
    closeEditor: () => setEditorDraft(null),
    // A price above 0 brings in the sale window, filled with its defaults.
    updateEditor: (patch: Partial<EventTicketDraft>) =>
      setEditorDraft((current) => (current ? withDefaultStart({ ...current, ...patch }) : current)),
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
