import { formatTime12 } from "@/components/ui/TimePicker";
import { saleEnd, ticketPrice, type EventTicketDraft } from "@/hooks/event-form/useEventTicketsForm";
import { isoToHn } from "@/hooks/event-form/time";

const dayFmt = new Intl.DateTimeFormat("es-HN", { day: "numeric", month: "short" });

/** `YYYY-MM-DD` + `HH:mm` as "20 oct, 9:00 a. m.". */
export function formatSaleMoment(date: string, time: string): string {
  return `${dayFmt.format(new Date(`${date}T12:00:00`))}, ${formatTime12(time)}`;
}

/** When an entry is on sale, in a line: what the ticket list shows. */
export function saleWindowLabel(draft: EventTicketDraft, eventStartsAt: string | null): string {
  if (ticketPrice(draft) <= 0) return "Gratis, disponible desde que se publica el evento";
  const end = saleEnd(draft, eventStartsAt);
  const hasStart = Boolean(draft.saleStartDate && draft.saleStartTime);
  const hasEnd = Boolean(end.date && end.time);
  const from = hasStart
    ? `del ${formatSaleMoment(draft.saleStartDate, draft.saleStartTime)}`
    : "desde que se publica";
  if (!hasEnd) return `A la venta ${from} hasta que empiece el evento`;
  const to = formatSaleMoment(end.date, end.time);
  return hasStart ? `A la venta ${from} al ${to}` : `A la venta ${from} hasta el ${to}`;
}

/** The event's start as "20 oct, 9:00 a. m.", or null while it has none. */
export function eventStartLabel(eventStartsAt: string | null): string | null {
  const start = isoToHn(eventStartsAt);
  return start.date && start.time ? formatSaleMoment(start.date, start.time) : null;
}
