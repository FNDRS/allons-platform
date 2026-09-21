import Link from "next/link";
import { ChevronRight, MapPin, QrCode } from "lucide-react";
import { formatEventWhen } from "@/lib/allons-api";
import type { TicketListItem } from "@/lib/api/tickets";

/** One row per event: a themed accent block, the copy, and a QR hint. */
export function TicketCard({ ticket }: { ticket: TicketListItem }) {
  const when = formatEventWhen(ticket.event?.startsAt ?? null);
  const tint = /^#[0-9a-f]{6}$/i.test(ticket.color ?? "") ? ticket.color! : "#f67010";
  const place = [ticket.event?.venue, ticket.event?.city].filter(Boolean).join(" · ");
  return (
    <Link
      href={`/tickets/${encodeURIComponent(ticket.id)}`}
      className="surface group flex items-stretch gap-4 p-3 pr-4 transition duration-200 hover:border-border-strong hover:bg-surface-2"
    >
      <span
        aria-hidden
        className="flex w-16 shrink-0 items-center justify-center rounded-[14px]"
        style={{
          background: `radial-gradient(120% 100% at 20% 0%, ${tint}66 0%, ${tint}22 60%, transparent 100%), rgba(255,255,255,0.04)`,
        }}
      >
        <QrCode className="size-6 text-white/80" />
      </span>
      <div className="min-w-0 flex-1 py-1">
        {when ? (
          <p className="text-[12px] font-bold uppercase tracking-[0.16em] text-accent">{when}</p>
        ) : null}
        <p className="mt-0.5 truncate text-[17px] font-bold tracking-tight">
          {ticket.event?.title ?? ticket.title}
        </p>
        <div className="mt-1 flex items-center gap-2 text-[13px] text-muted">
          {place ? (
            <span className="flex min-w-0 items-center gap-1.5 truncate">
              <MapPin className="size-3.5 shrink-0" aria-hidden />
              <span className="truncate">{place}</span>
            </span>
          ) : null}
          {ticket.attendeeCount > 1 ? (
            <span className="ml-auto shrink-0 rounded-full bg-surface-2 px-2 py-0.5 text-[12px] font-semibold text-white/80">
              {ticket.attendeeCount} tickets
            </span>
          ) : null}
        </div>
      </div>
      <ChevronRight className="size-5 shrink-0 self-center text-dim transition group-hover:text-white" aria-hidden />
    </Link>
  );
}
