"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { Package, Undo2 } from "lucide-react";
import { formatEventWhen } from "@/lib/allons-api";
import {
  isEntryTypeOnSale,
  type EventDetail,
  type EventEntryType,
  type PublicResourceGroup,
} from "@/lib/api/events";
import { formatDateTime, formatPriceCents } from "@/lib/format";
import { Card, SectionTitle } from "@/components/ui/Card";
import { CalendarMark, MetaTile, PinMark } from "@/components/ui/MetaTile";
import { ResourceGrid, studioFrontLabel } from "@/components/tickets/ResourceGrid";
import { StatusPill } from "@/components/ui/Pill";
import { EventCover, EventPosterWash } from "./EventCover";

export function EventHero({ event }: { event: EventDetail }) {
  const provider = event.provider;
  const handle = provider?.handle
    ? `@${provider.handle.replace(/^@/, "")}`
    : null;
  const avatarName = (provider?.name ?? event.title).trim();

  return (
    <header className="flex flex-col gap-5">
      <div className="overflow-hidden rounded-[28px] bg-black p-[5px] shadow-[0_24px_50px_rgba(0,0,0,0.35)]">
        <div className="relative aspect-[16/10] overflow-hidden rounded-[23px] bg-[#1c1c1e]">
          {event.coverImageUrl ? (
            <EventCover
              src={event.coverImageUrl}
              alt=""
              themeColor={event.themeColor}
            />
          ) : (
            <EventPosterWash themeColor={event.themeColor} />
          )}
        </div>
      </div>
      <div>
        <h1 className="text-[28px] font-bold leading-[1.05] tracking-[-0.03em] sm:text-[36px]">
          {event.title}
        </h1>
        {provider?.name ? (
          <Link
            href={`/${encodeURIComponent(provider.handle?.replace(/^@/, "") || provider.id)}`}
            className="mt-4 inline-flex max-w-full items-center gap-3 rounded-full pr-4 transition hover:bg-white/[0.04]"
            aria-label={`Ver el perfil de ${provider.name}`}
          >
            <HostMark src={provider.logoUrl} name={avatarName} />
            <div className="min-w-0">
              <p className="truncate text-[15px] font-semibold tracking-tight">
                {provider.name}
              </p>
              <p className="truncate text-[13px] text-white/45">
                {handle ?? "Ver perfil"}
              </p>
            </div>
          </Link>
        ) : null}
      </div>
    </header>
  );
}

function HostMark({ src, name }: { src?: string | null; name: string }) {
  const initial = name.charAt(0).toUpperCase() || "A";
  return (
    <span className="relative size-11 shrink-0 overflow-hidden rounded-[12px] bg-black ring-1 ring-white/12">
      {src ? (
        <img src={src} alt="" className="h-full w-full object-cover" />
      ) : (
        <span className="grid h-full w-full place-items-center text-sm font-bold text-accent">
          {initial}
        </span>
      )}
    </span>
  );
}

export function EventMeta({ event }: { event: EventDetail }) {
  const when = formatEventWhen(event.startsAt);
  const mapsUrl =
    event.latitude != null && event.longitude != null
      ? `https://www.google.com/maps/search/?api=1&query=${event.latitude},${event.longitude}`
      : event.address || event.venue
        ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([event.venue, event.address, event.city].filter(Boolean).join(", "))}`
        : null;
  const place = event.venue ?? event.address ?? event.city;
  const placeLabel = [place, place !== event.city ? event.city : null]
    .filter(Boolean)
    .join(" · ");

  if (!when && !place && !(event.attendeeCount && event.attendeeCount > 0)) {
    return null;
  }

  return (
    <ul className="flex flex-col gap-2">
      {when ? (
        <MetaTile icon={<CalendarMark />} label="Cuándo">
          {when}
        </MetaTile>
      ) : null}
      {place ? (
        <MetaTile icon={<PinMark />} label="Dónde" href={mapsUrl}>
          {placeLabel}
        </MetaTile>
      ) : null}
      {typeof event.attendeeCount === "number" && event.attendeeCount > 0 ? (
        <MetaTile icon={<PeopleMark />} label="Asistencia">
          {event.attendeeCount}{" "}
          {event.attendeeCount === 1 ? "persona va" : "personas van"}
        </MetaTile>
      ) : null}
    </ul>
  );
}

function PeopleMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-[18px]" fill="none" aria-hidden>
      <circle cx="9.2" cy="8.4" r="2.4" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M4.5 18.2c.4-2.8 2.4-4.4 4.7-4.4s4.3 1.6 4.7 4.4"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <circle cx="16.2" cy="9" r="2" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M15.2 13.9c1.9.2 3.5 1.5 3.9 4.3"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function EventDescription({ text }: { text: string | null }) {
  if (!text?.trim()) return null;
  return (
    <section>
      <SectionTitle>Sobre el evento</SectionTitle>
      <p className="whitespace-pre-line text-[16px] leading-7 text-white/80">{text}</p>
    </section>
  );
}

export function EntryTypesCard({ types }: { types: EventEntryType[] }) {
  if (types.length === 0) return null;
  const now = Date.now();
  return (
    <section>
      <SectionTitle>Entradas</SectionTitle>
      <Card padding="none" className="divide-y divide-border">
        {types.map((type) => {
          const onSale = isEntryTypeOnSale(type, now);
          const soldOut = type.soldOut || type.remaining === 0;
          const status = soldOut
            ? "Agotado"
            : !onSale && type.saleStartsAt && new Date(type.saleStartsAt).getTime() > now
              ? `A la venta desde ${formatDateTime(type.saleStartsAt)}`
              : !onSale
                ? "Venta cerrada"
                : type.remaining != null
                  ? `${type.remaining} disponibles`
                  : "Disponible";
          return (
            <div key={type.id} className={`flex items-center justify-between gap-4 px-5 py-4 ${soldOut || !onSale ? "opacity-60" : ""}`}>
              <div className="min-w-0">
                <p className="text-[15px] font-bold tracking-tight">{type.name}</p>
                <p className="mt-0.5 text-[13px] text-muted">{status}</p>
              </div>
              <p className="shrink-0 text-[17px] font-bold tabular-nums tracking-tight">
                {formatPriceCents(type.priceCents)}
              </p>
            </div>
          );
        })}
      </Card>
    </section>
  );
}

export function ResourcePreviewCard({ groups }: { groups: PublicResourceGroup[] }) {
  if (groups.length === 0) return null;
  return (
    <section>
      <SectionTitle>Al comprar eliges</SectionTitle>
      <div className="flex flex-col gap-3">
        {groups.map((group) => {
          const open = group.available > 0;
          return (
            <Card key={group.id}>
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[16px] font-bold tracking-tight">
                    Tu {group.name.toLowerCase()}
                  </p>
                  <p className="mt-0.5 text-[13px] text-muted">
                    {group.available} de {group.total} libres
                  </p>
                </div>
                <StatusPill tone={open ? "solid" : "mute"}>
                  {open ? "Hay lugar" : "Sin lugar"}
                </StatusPill>
              </div>
              <div className="mt-4">
                <ResourceGrid
                  compact
                  columns={group.columns}
                  frontLabel={studioFrontLabel(group.name)}
                  tiles={group.resources.map((unit) => ({
                    id: unit.id,
                    label: unit.label,
                    taken: unit.taken,
                  }))}
                />
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
}

export function KitPickupCard({ info }: { info: string | null | undefined }) {
  if (!info?.trim()) return null;
  return (
    <Card className="flex gap-4">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
        <Package className="size-4" aria-hidden />
      </span>
      <div>
        <p className="text-[15px] font-bold tracking-tight">Retiro de kit</p>
        <p className="mt-1 whitespace-pre-line text-sm leading-6 text-white/70">{info}</p>
      </div>
    </Card>
  );
}

export function RefundPolicyNote({ event }: { event: EventDetail }) {
  const policy = event.refundPolicy ?? "none";
  const text =
    policy === "none"
      ? "Este evento no admite reembolsos."
      : policy === "full"
        ? `Reembolso completo si cancelas${event.refundDeadlineDays ? ` hasta ${event.refundDeadlineDays} día(s) antes` : ""}.`
        : `Reembolso del ${event.refundPartialPct ?? 0}% si cancelas${event.refundDeadlineDays ? ` hasta ${event.refundDeadlineDays} día(s) antes` : ""}.`;
  return (
    <p className="flex items-center gap-2 text-[13px] text-dim">
      <Undo2 className="size-4" aria-hidden /> {text}
    </p>
  );
}
