"use client";

/* eslint-disable @next/next/no-img-element */

import type { ReactNode } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, Building2, CalendarDays, Car, Clock, PawPrint, User, Users } from "lucide-react";
import { cheapestListedCents, useBuyerUnitPrices } from "@/hooks/useBuyerUnitPrices";
import { usePrefetchEvent } from "@/hooks/usePrefetchEvent";
import {
  eventCategoryName,
  eventKeys,
  getEvent,
  type EventListItem,
} from "@/lib/api/events";
import {
  formatCardDay,
  formatCardPrice,
  formatCardTime,
  formatNumber,
} from "@/lib/format";
import { EventCover, EventPosterWash } from "./EventCover";
import { EventHoverVideo } from "./EventHoverVideo";
import { glassCtaClass } from "@/components/ui/cta";
import { PAYMENTS_OUTAGE } from "@/lib/paymentsOutage";

/**
 * Respaldo mientras `hoverVideoUrl` se llena desde el panel.
 *
 * El video vivia solo aca, asi que agregar uno pedia tocar codigo y desplegar
 * el sitio. Ahora manda la columna; este mapa evita que un evento ya publicado
 * se quede sin video entre el deploy y el momento en que alguien lo cargue, y
 * se borra cuando no quede ninguno apuntando aca.
 */
const LEGACY_HOVER_VIDEO_BY_HANDLE: Record<string, string> = {
  kinetix: "/providers/kinetix-hover.mp4",
};

/** Event card: 16:9 cover, category, facts, description and Reservar. */
export function EventCard({ event }: { event: EventListItem }) {
  const prefetchEvent = usePrefetchEvent();
  const warm = () => prefetchEvent(event.id);
  const soldOut = event.status === "sold_out";
  const provider = event.provider;
  const price = useCardPrice(event, soldOut);
  const address = placeLine(event.venue, event.address, event.city);
  const day = formatCardDay(event.startsAt);
  const time = formatCardTime(event.startsAt);
  const category = eventCategoryName(event);
  const description = event.description?.trim() || "";
  const hoverSrc =
    event.hoverVideoUrl?.trim() ||
    (provider?.handle
      ? LEGACY_HOVER_VIDEO_BY_HANDLE[provider.handle.replace(/^@/, "")]
      : undefined);

  return (
    <Link
      href={`/eventos/${encodeURIComponent(event.id)}`}
      className="group block h-full w-full"
      onMouseEnter={warm}
      onTouchStart={warm}
      onFocus={warm}
    >
      <article className="event-phone relative flex h-full min-w-0 flex-col overflow-hidden rounded-[28px] border border-white/10 bg-black shadow-[0_24px_50px_rgba(0,0,0,0.38)] sm:rounded-[32px]">
        <div className="relative aspect-video shrink-0 overflow-hidden bg-black">
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
          {category ? (
            <span className="absolute left-4 top-4 z-10 rounded-full border border-white/15 bg-black/55 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white/85 backdrop-blur">
              {category}
            </span>
          ) : null}
        </div>

        <div className="relative z-10 flex min-w-0 flex-1 flex-col px-4 pb-4 pt-4 sm:px-5 sm:pb-5">
          <h3 className="line-clamp-2 break-words text-[20px] font-semibold leading-[1.12] tracking-[-0.03em] text-white sm:text-[22px]">
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

          {description ? (
            <p className="mt-3 line-clamp-3 text-[13px] leading-5 text-white/60">
              {description}
            </p>
          ) : null}

          <div className="mt-auto flex items-center gap-3 pt-4">
            <p
              className={`min-w-0 shrink-0 text-[15px] font-semibold tracking-tight tabular-nums ${
                soldOut ? "text-white/45" : "text-white"
              }`}
            >
              {price ?? (
                <span
                  aria-hidden
                  className="inline-block h-[1.15em] w-20 shimmer rounded-md align-middle"
                />
              )}
            </p>
            {soldOut ? null : PAYMENTS_OUTAGE && event.minPriceCents !== 0 ? (
              <span className="inline-flex h-11 min-w-0 flex-1 items-center justify-center rounded-full border border-white/10 text-[13px] text-white/45">
                Pagos pausados
              </span>
            ) : (
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

/**
 * "Desde" the cheapest ticket, at what the buyer pays. The list only carries
 * the first session's list price, so this reads the detail (the same cache
 * entry the hover prefetch and the event page use) and quotes each price.
 * Null while that is loading.
 */
function useCardPrice(event: EventListItem, soldOut: boolean): string | null {
  const detail = useQuery({
    queryKey: eventKeys.detail(event.id),
    queryFn: () => getEvent(event.id),
    enabled: !soldOut,
    staleTime: 30_000,
  });
  const types = detail.data?.entryTypes ?? [];
  const listed = useBuyerUnitPrices(event.id, types, detail.data?.feeMode);

  if (soldOut) return "Agotado";
  if (detail.isError) return formatCardPrice(event.minPriceCents);
  if (!detail.data) return null;
  if (types.length === 0) return formatCardPrice(event.minPriceCents);
  const cheapest = cheapestListedCents(types, listed.priceCentsFor);
  if (cheapest == null) return null;
  const varies = new Set(types.map((type) => type.priceCents)).size > 1;
  const amount = formatCardPrice(cheapest);
  return varies && cheapest > 0 ? `Desde ${amount}` : amount;
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
