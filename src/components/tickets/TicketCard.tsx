import Link from "next/link";
import { ChevronRight, MapPin } from "lucide-react";
import { formatEventWhen } from "@/lib/allons-api";
import type { TicketListItem } from "@/lib/api/tickets";

export function TicketCard({ ticket }: { ticket: TicketListItem }) {
  const when = formatEventWhen(ticket.event?.startsAt ?? null);
  const tint = /^#[0-9a-f]{6}$/i.test(ticket.color ?? "") ? ticket.color! : "#f67010";
  return (
    <Link
      href={`/tickets/${encodeURIComponent(ticket.id)}`}
      className="flex items-center gap-4 rounded-[22px] border border-white/[0.08] bg-white/[0.03] p-4 transition hover:bg-white/[0.06]"
    >
      <span
        aria-hidden
        className="h-14 w-1.5 shrink-0 rounded-full"
        style={{ background: tint }}
      />
      <div className="min-w-0 flex-1">
        {when ? (
          <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-accent">{when}</p>
        ) : null}
        <p className="mt-0.5 truncate text-lg font-semibold tracking-tight">
          {ticket.event?.title ?? ticket.title}
        </p>
        <p className="mt-0.5 flex items-center gap-1.5 truncate text-sm text-white/50">
          {ticket.event?.venue || ticket.event?.city ? (
            <>
              <MapPin className="size-3.5 shrink-0" aria-hidden />
              {[ticket.event?.venue, ticket.event?.city].filter(Boolean).join(" · ")}
            </>
          ) : null}
          {ticket.attendeeCount > 1 ? (
            <span className="ml-auto shrink-0 rounded-full bg-white/[0.08] px-2 py-0.5 text-[12px] font-semibold text-white/70">
              {ticket.attendeeCount} tickets
            </span>
          ) : null}
        </p>
      </div>
      <ChevronRight className="size-5 shrink-0 text-white/30" aria-hidden />
    </Link>
  );
}
