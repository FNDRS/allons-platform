import Link from "next/link";
import { formatEventWhen } from "@/lib/allons-api";
import type { TicketListItem } from "@/lib/api/tickets";
import { EventPosterWash } from "@/components/events/EventCover";

/** Full-width pass: poster wash, overlay copy, Ver pase. */
export function TicketCard({
  ticket,
  past = false,
}: {
  ticket: TicketListItem;
  past?: boolean;
}) {
  const when = formatEventWhen(ticket.event?.startsAt ?? null);
  const place = [ticket.event?.venue, ticket.event?.city].filter(Boolean).join(" · ");
  const tint = ticket.event?.themeColor ?? ticket.color;
  const title = ticket.event?.title ?? ticket.title;

  return (
    <Link
      href={`/tickets/${encodeURIComponent(ticket.id)}`}
      className="group block h-full w-full"
    >
      <article className="event-phone relative flex min-h-[210px] w-full flex-col overflow-hidden rounded-[32px] border border-white/10 bg-black shadow-[0_24px_50px_rgba(0,0,0,0.38)] sm:min-h-[240px]">
        <div className="absolute inset-0">
          <EventPosterWash themeColor={tint} className="event-phone-poster" />
        </div>
        <div
          className={`pointer-events-none absolute inset-0 ${
            past
              ? "bg-gradient-to-t from-black from-[16%] via-black/75 via-48% to-black/35"
              : "bg-gradient-to-t from-black from-[14%] via-black/62 via-46% to-black/12"
          }`}
          aria-hidden
        />

        <div className="relative z-10 flex flex-1 flex-col justify-between p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <span
              className={`rounded-full px-3 py-1 text-[11px] font-semibold tracking-tight ${
                past
                  ? "bg-white/10 text-white/70 ring-1 ring-white/10"
                  : "bg-white/92 text-black shadow-[0_6px_18px_rgba(0,0,0,0.18)]"
              }`}
            >
              {past ? "Pasado" : "Tu pase"}
            </span>
            {ticket.attendeeCount > 1 ? (
              <span className="rounded-full bg-black/45 px-3 py-1 text-[11px] font-semibold text-white/80 ring-1 ring-white/15 backdrop-blur-md">
                {ticket.attendeeCount} tickets
              </span>
            ) : null}
          </div>

          <div className="mt-12 flex flex-col gap-4 sm:mt-16 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              {when ? (
                <p className="text-[13px] text-white/72">{when}</p>
              ) : null}
              <h3 className="mt-1.5 line-clamp-2 text-[22px] font-semibold leading-[1.12] tracking-[-0.03em] text-white sm:text-[26px]">
                {title}
              </h3>
              {place ? (
                <p className="mt-2 flex items-center gap-1.5 text-[13px] font-medium text-white/78">
                  <PinMark />
                  <span className="truncate">{place}</span>
                </p>
              ) : null}
            </div>
            <span className="w-fit shrink-0 rounded-full bg-white px-4 py-2.5 text-[13px] font-semibold tracking-tight text-black">
              Ver pase
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

function PinMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-3.5 shrink-0" fill="none" aria-hidden>
      <path
        d="M12 21s6.5-5.2 6.5-10.2A6.5 6.5 0 0 0 5.5 10.8C5.5 15.8 12 21 12 21Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="10.6" r="2.1" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}
