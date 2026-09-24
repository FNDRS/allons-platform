import type { ReactNode } from "react";
import Link from "next/link";
import { Building2, CalendarDays, Car, Clock, Ticket, User } from "lucide-react";
import type { TicketListItem } from "@/lib/api/tickets";
import { EventPosterWash } from "@/components/events/EventCover";
import { StatusPill } from "@/components/ui/Pill";
import { glassCtaClass } from "@/components/ui/cta";

/** Full-width pass with overlay facts, like a listing card. */
export function TicketCard({
  ticket,
  past = false,
}: {
  ticket: TicketListItem;
  past?: boolean;
}) {
  const event = ticket.event;
  const title = event?.title ?? ticket.title;
  const tint = event?.themeColor ?? ticket.color;
  const address = placeLine(event?.venue, event?.address, event?.city);
  const day = formatTicketDay(event?.startsAt ?? null);
  const time = formatTicketTime(event?.startsAt ?? null);
  const ticketsLabel =
    ticket.attendeeCount === 1 ? "1 ticket" : `${ticket.attendeeCount} tickets`;
  const typeName = ticket.ticketTypeName?.trim() || null;
  const typeLabel = typeName && typeName !== title ? typeName : null;
  const handle = event?.provider?.handle
    ? `@${event.provider.handle.replace(/^@/, "")}`
    : event?.provider?.name ?? null;
  const badge = past ? "Pasado" : handle ?? "Tu pase";

  return (
    <Link
      href={`/tickets/${encodeURIComponent(ticket.id)}`}
      className="group block h-full w-full"
    >
      <article className="event-phone relative flex min-h-[280px] w-full flex-col overflow-hidden rounded-[32px] border border-white/10 bg-black shadow-[0_24px_50px_rgba(0,0,0,0.38)] sm:min-h-[320px]">
        <div className="absolute inset-0">
          <EventPosterWash themeColor={tint} className="event-phone-poster" />
        </div>
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[72%] bg-gradient-to-t from-black from-[14%] via-black/72 via-46% to-transparent"
          aria-hidden
        />

        <span className="absolute left-4 top-4 z-10">
          <StatusPill tone={past ? "mute" : "solid"}>{badge}</StatusPill>
        </span>

        <div className="relative z-10 mt-auto flex flex-col px-5 pb-5 pt-16 sm:px-6 sm:pb-6">
          <h3 className="line-clamp-2 text-[24px] font-semibold leading-[1.12] tracking-[-0.03em] text-white sm:text-[28px]">
            {title}
          </h3>
          {address ? (
            <p className="mt-2 flex items-center gap-1.5 text-[13px] font-medium text-white/78">
              <Building2 className="size-3.5 shrink-0" aria-hidden />
              <span className="truncate">{address}</span>
            </p>
          ) : null}

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[13px] font-medium text-white/78">
            {day ? (
              <Stat icon={<CalendarDays className="size-3.5" />}>{day}</Stat>
            ) : null}
            {time ? (
              <Stat icon={<Clock className="size-3.5" />}>{time}</Stat>
            ) : null}
            <Stat icon={<Ticket className="size-3.5" />}>{ticketsLabel}</Stat>
            {event?.parkingAvailable ? (
              <Stat icon={<Car className="size-3.5" />}>Parqueo</Stat>
            ) : null}
            {event?.minAge ? (
              <Stat icon={<User className="size-3.5" />}>+{event.minAge}</Stat>
            ) : null}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-black/45 px-4 py-2.5 text-[13px] font-semibold tracking-tight text-white ring-1 ring-white/15 backdrop-blur-md">
              {typeLabel ?? ticket.holderName ?? ticketsLabel}
            </span>
            <span
              className={`inline-flex items-center rounded-full px-4 py-2.5 text-[13px] ${glassCtaClass}`}
            >
              Ver pase
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

function Stat({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <span className="inline-flex min-w-0 items-center gap-1.5">
      <span className="shrink-0 text-white/70" aria-hidden>{icon}</span>
      <span className="truncate">{children}</span>
    </span>
  );
}

function placeLine(
  venue?: string | null,
  address?: string | null,
  city?: string | null,
) {
  const v = venue?.trim() || null;
  const a = address?.trim() || null;
  const c = city?.trim() || null;
  const bits: string[] = [];
  if (v) bits.push(v);
  if (a && a !== v) bits.push(a);
  const blob = bits.join(" ").toLowerCase();
  if (c && !blob.includes(c.toLowerCase())) bits.push(c);
  return bits.join(", ");
}

function formatTicketDay(startsAt: string | null): string | null {
  if (!startsAt) return null;
  const date = new Date(startsAt);
  if (Number.isNaN(date.getTime())) return null;
  const label = date.toLocaleDateString("es-HN", {
    timeZone: "America/Tegucigalpa",
    weekday: "short",
    day: "numeric",
    month: "short",
  });
  return label.replace(/\.$/, "");
}

function formatTicketTime(startsAt: string | null): string | null {
  if (!startsAt) return null;
  const date = new Date(startsAt);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleTimeString("es-HN", {
    timeZone: "America/Tegucigalpa",
    hour: "numeric",
    minute: "2-digit",
  });
}
