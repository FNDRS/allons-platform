"use client";

/* eslint-disable @next/next/no-img-element */

import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowUpRight, Building2, CalendarDays, Clock, Ticket } from "lucide-react";
import { usePrefetchProviderEvent } from "@/hooks/usePrefetchProviderEvent";
import type { ProviderEventListItem } from "@/lib/api/provider";
import { formatCardDay, formatCardTime, formatHNL, formatNumber } from "@/lib/format";

const STATUS: Record<string, string> = {
  published: "Publicado",
  draft: "Borrador",
  sold_out: "Agotado",
  ended: "Finalizado",
};

export function ProviderEventCard({ event }: { event: ProviderEventListItem }) {
  const status = STATUS[event.status] ?? event.status;
  const prefetch = usePrefetchProviderEvent();
  const warm = () => prefetch(event.id);
  const day = formatCardDay(event.startsAt);
  const time = formatCardTime(event.startsAt);
  const sold =
    event.capacity > 0
      ? `${formatNumber(event.ticketsSold)} / ${formatNumber(event.capacity)}`
      : formatNumber(event.ticketsSold);
  const fill =
    event.capacity > 0
      ? Math.min(100, Math.round((event.ticketsSold / event.capacity) * 100))
      : 0;

  return (
    <Link
      href={`/comercio/events/${encodeURIComponent(event.id)}`}
      onMouseEnter={warm}
      onFocus={warm}
      onTouchStart={warm}
      className="group block h-full w-full"
    >
      <article className="flex h-full flex-col rounded-[24px] border border-white/[0.08] bg-white/[0.03] p-5 transition duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:border-white/[0.14] hover:bg-white/[0.05]">
        <div className="flex min-w-0 items-start gap-3">
          {event.coverImageUrl ? (
            <img
              src={event.coverImageUrl}
              alt=""
              className="size-12 shrink-0 rounded-[12px] object-cover ring-1 ring-white/10"
            />
          ) : null}
          <div className="min-w-0">
            <h3 className="line-clamp-2 text-[17px] font-semibold leading-[1.2] tracking-[-0.02em] text-white">
              {event.title}
            </h3>
            <p className="mt-1 text-[13px] text-white/40">{status}</p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-white/55">
          {event.city ? (
            <Stat icon={<Building2 className="size-3.5" strokeWidth={1.5} />}>
              {event.city}
            </Stat>
          ) : null}
          <Stat icon={<CalendarDays className="size-3.5" strokeWidth={1.5} />}>
            {day ?? "Sin fecha"}
          </Stat>
          {time ? (
            <Stat icon={<Clock className="size-3.5" strokeWidth={1.5} />}>{time}</Stat>
          ) : null}
          <Stat icon={<Ticket className="size-3.5" strokeWidth={1.5} />}>{sold} vendidos</Stat>
        </div>

        {event.capacity > 0 ? (
          <div
            className="mt-4 h-px w-full overflow-hidden rounded-full bg-white/[0.08]"
            aria-hidden
          >
            <div
              className="h-full bg-white/40"
              style={{ width: `${fill}%` }}
            />
          </div>
        ) : (
          <div className="mt-4 h-px w-full bg-white/[0.06]" aria-hidden />
        )}

        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="text-[15px] font-semibold tabular-nums tracking-tight">
            {formatHNL(event.revenue)}
          </p>
          <span className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-white pl-4 pr-3 text-[13px] font-semibold tracking-tight text-black">
            Abrir
            <ArrowUpRight
              className="size-3.5 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              strokeWidth={1.75}
              aria-hidden
            />
          </span>
        </div>
      </article>
    </Link>
  );
}

function Stat({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <span className="inline-flex min-w-0 items-center gap-1.5">
      <span className="shrink-0 text-white/35">{icon}</span>
      <span className="truncate">{children}</span>
    </span>
  );
}
