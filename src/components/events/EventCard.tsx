"use client";

/* eslint-disable @next/next/no-img-element */

import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowUpRight, Building2, CalendarDays, Car, Clock, PawPrint, User, Users } from "lucide-react";
import { usePrefetchEvent } from "@/hooks/usePrefetchEvent";
import type { EventListItem } from "@/lib/api/events";
import {
  formatCardDay,
  formatCardTime,
  formatNumber,
  formatPriceCents,
} from "@/lib/format";
import { EventCover, EventPosterWash } from "./EventCover";
import { EventHoverVideo } from "./EventHoverVideo";
import { glassCtaClass } from "@/components/ui/cta";

const HOVER_VIDEO_BY_HANDLE: Record<string, string> = {
  kinetix: "/providers/kinetix-hover.mp4",
};

/** Full-bleed photo card: overlay copy, icon facts, full-width Reservar. */
export function EventCard({ event }: { event: EventListItem }) {
  const prefetchEvent = usePrefetchEvent();
  const warm = () => prefetchEvent(event.id);
  const soldOut = event.status === "sold_out";
  const provider = event.provider;
  const price = soldOut ? "Agotado" : formatPriceCents(event.minPriceCents);
  const address = placeLine(event.venue, event.address, event.city);
  const day = formatCardDay(event.startsAt);
  const time = formatCardTime(event.startsAt);
  const hoverSrc = provider?.handle
    ? HOVER_VIDEO_BY_HANDLE[provider.handle.replace(/^@/, "")]
    : undefined;

  return (
    <Link
      href={`/eventos/${encodeURIComponent(event.id)}`}
      className="group block h-full w-full"
      onMouseEnter={warm}
      onTouchStart={warm}
      onFocus={warm}
    >
      <article className="event-phone relative flex aspect-[4/4.2] flex-col overflow-hidden rounded-[32px] border border-white/10 bg-black shadow-[0_24px_50px_rgba(0,0,0,0.38)]">
        <div className="absolute inset-0">
          {event.coverImageUrl ? (
            <EventCover
              src={event.coverImageUrl}
              alt=""
              themeColor={event.themeColor}
              className="event-phone-poster"
            />
          ) : (
            <EventPosterWash
              themeColor={event.themeColor}
              className="event-phone-poster"
            />
          )}
          {hoverSrc ? <EventHoverVideo src={hoverSrc} /> : null}
        </div>

        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[68%] bg-gradient-to-t from-black from-[16%] via-black/72 via-46% to-transparent"
          aria-hidden
        />

        <div className="relative z-10 mt-auto flex flex-col px-5 pb-5 pt-12">
          <h3 className="line-clamp-2 text-[22px] font-semibold leading-[1.12] tracking-[-0.03em] text-white">
            {event.title}
          </h3>
          {address ? (
            <p className="mt-1.5 flex items-center gap-1.5 text-[13px] font-medium text-white/78">
              <Building2 className="size-3.5 shrink-0" aria-hidden />
              <span className="truncate">{address}</span>
            </p>
          ) : null}

          <div className="mt-2.5 flex flex-wrap items-center gap-x-3.5 gap-y-1 text-[13px] font-medium text-white/78">
            {day ? (
              <Stat icon={<CalendarDays className="size-3.5" />}>{day}</Stat>
            ) : null}
            {time ? (
              <Stat icon={<Clock className="size-3.5" />}>{time}</Stat>
            ) : null}
            {event.capacity ? (
              <Stat icon={<Users className="size-3.5" />}>
                {formatNumber(event.capacity)} cupos
              </Stat>
            ) : null}
            {event.parkingAvailable ? (
              <Stat icon={<Car className="size-3.5" />}>Parqueo</Stat>
            ) : null}
            {event.petFriendly ? (
              <Stat icon={<PawPrint className="size-3.5" />}>Mascotas</Stat>
            ) : null}
            {event.minAge ? (
              <Stat icon={<User className="size-3.5" />}>+{event.minAge}</Stat>
            ) : null}
          </div>

          <div className="mt-4 flex items-center gap-3">
            <p
              className={`min-w-0 shrink-0 text-[15px] font-semibold tracking-tight tabular-nums ${
                soldOut ? "text-white/45" : "text-white"
              }`}
            >
              {price}
            </p>
            {soldOut ? null : (
              <span
                className={`inline-flex h-11 min-w-0 flex-1 items-center justify-center gap-1.5 text-[13px] ${glassCtaClass}`}
              >
                Reservar
                <ArrowUpRight
                  className="size-3.5 text-white/45 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-white/70"
                  strokeWidth={1.5}
                  aria-hidden
                />
              </span>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}

function Stat({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <span className="inline-flex min-w-0 items-center gap-1.5">
      <span className="shrink-0 text-white/70">{icon}</span>
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
