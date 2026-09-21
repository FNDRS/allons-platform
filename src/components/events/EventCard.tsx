"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { MapPin } from "lucide-react";
import { usePrefetchEvent } from "@/hooks/usePrefetchEvent";
import { formatEventWhen } from "@/lib/allons-api";
import type { EventListItem } from "@/lib/api/events";
import { formatPriceCents } from "@/lib/format";
import { EventCover, EventPosterWash } from "./EventCover";
import { EventHoverVideo } from "./EventHoverVideo";

const HOVER_VIDEO_BY_HANDLE: Record<string, string> = {
  kinetix: "/providers/kinetix-hover.mp4",
};

/** Full-bleed photo card: overlay copy, price pill, Reservar. */
export function EventCard({ event }: { event: EventListItem }) {
  const prefetchEvent = usePrefetchEvent();
  const warm = () => prefetchEvent(event.id);
  const when = formatEventWhen(event.startsAt);
  const soldOut = event.status === "sold_out";
  const provider = event.provider;
  const price = soldOut ? "Agotado" : formatPriceCents(event.minPriceCents);
  const place = event.city?.trim() || null;
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
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[62%] bg-gradient-to-t from-black from-[12%] via-black/70 via-42% to-transparent"
          aria-hidden
        />

        {badge ? (
          <span className="absolute left-4 top-4 z-10 rounded-full bg-white/92 px-3 py-1 text-[11px] font-semibold tracking-tight text-black shadow-[0_6px_18px_rgba(0,0,0,0.18)]">
            {badge}
          </span>
        ) : null}

        <div className="relative z-10 mt-auto flex flex-col px-5 pb-5 pt-16">
          <h3 className="line-clamp-2 text-[22px] font-semibold leading-[1.12] tracking-[-0.03em] text-white">
            {event.title}
          </h3>
          {when ? (
            <p className="mt-2 line-clamp-1 text-[13px] text-white/72">{when}</p>
          ) : null}
          {place ? (
            <p className="mt-1.5 flex items-center gap-1.5 text-[13px] font-medium text-white/78">
              <MapPin className="size-3.5 shrink-0" aria-hidden />
              <span className="truncate">{place}</span>
            </p>
          ) : null}
          <div className="mt-4 flex items-center gap-2">
            <span
              className={`rounded-full px-4 py-2.5 text-[13px] font-semibold tracking-tight ${
                soldOut
                  ? "bg-white/10 text-white/45"
                  : "bg-black/45 text-white ring-1 ring-white/15 backdrop-blur-md"
              }`}
            >
              {price}
            </span>
            {soldOut ? null : (
              <span className="rounded-full bg-white px-4 py-2.5 text-[13px] font-semibold tracking-tight text-black">
                Reservar
              </span>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}
