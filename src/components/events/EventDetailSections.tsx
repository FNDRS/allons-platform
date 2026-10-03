"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { Flag, Handshake, Package, Undo2 } from "lucide-react";
import { formatEventWhen } from "@/lib/allons-api";
import { instagramLink } from "@/lib/instagram";
import { whatsappLink } from "@/lib/whatsapp";
import { InstagramMark } from "@/components/shared/InstagramMark";
import { WhatsAppMark } from "@/components/shared/WhatsAppMark";
import {
  isEntryTypeOnSale,
  isEntryTypeUpcoming,
  type EventDetail,
  type EventEntryType,
} from "@/lib/api/events";
import { formatDateTime } from "@/lib/format";
import { ListedPrice } from "@/components/ui/ListedPrice";
import { Card, SectionTitle } from "@/components/ui/Card";
import { CalendarMark, MetaTile, PinMark } from "@/components/ui/MetaTile";
import { EventCover, EventPosterWash } from "./EventCover";

export function EventHero({ event }: { event: EventDetail }) {
  const provider = event.provider;
  const handle = provider?.handle
    ? `@${provider.handle.replace(/^@/, "")}`
    : null;
  const avatarName = (provider?.name ?? event.title).trim();
  const collaborators = event.collaborators ?? [];

  return (
    <header className="flex flex-col gap-5">
      <div className="overflow-hidden rounded-[28px] bg-black p-[5px] shadow-[0_24px_50px_rgba(0,0,0,0.35)]">
        <div className="relative aspect-video overflow-hidden rounded-[23px] bg-[#1c1c1e]">
          {event.coverImageUrl ? (
            <EventCover
              src={event.coverImageUrl}
              alt={`Portada de ${event.title}`}
              themeColor={event.themeColor}
            />
          ) : (
            <EventPosterWash themeColor={event.themeColor} />
          )}
        </div>
      </div>
      <div>
        <h1 className="break-words text-[28px] font-bold leading-[1.05] tracking-[-0.03em] sm:text-[36px]">
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
        {collaborators.length > 0 ? (
          <EventCollaborators collaborators={collaborators} />
        ) : null}
        {(event.campaigns ?? []).map((campaign) => (
          <Link
            key={campaign.id}
            href={`/campanas/${encodeURIComponent(campaign.slug)}`}
            className="mt-4 flex items-center gap-3 rounded-[20px] border border-white/[0.08] bg-white/[0.03] px-4 py-3.5 transition hover:bg-white/[0.06]"
          >
            <Flag className="size-4 shrink-0 text-accent" strokeWidth={1.7} aria-hidden />
            <span className="min-w-0">
              <span className="block text-[12px] font-semibold uppercase tracking-[0.14em] text-accent">
                Parte de una campaña
              </span>
              <span className="block truncate text-[15px] font-semibold tracking-tight">
                {campaign.name}
              </span>
              <span className="block truncate text-[13px] text-white/45">
                Ver todos sus eventos
              </span>
            </span>
          </Link>
        ))}
      </div>
    </header>
  );
}

/**
 * The other comercios behind a collaborative event, right under the
 * organizer so the attendee sees who is in it, each linking to its
 * profile like the host does.
 */
function EventCollaborators({
  collaborators,
}: {
  collaborators: NonNullable<EventDetail["collaborators"]>;
}) {
  return (
    <div className="mt-4 rounded-[20px] border border-white/[0.08] bg-white/[0.03] px-4 py-3.5">
      <p className="inline-flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-[0.14em] text-accent">
        <Handshake className="size-3.5" strokeWidth={1.7} aria-hidden />
        Evento colaborativo
      </p>
      <p className="mt-1 text-[13px] text-white/45">
        Organizado junto con{" "}
        {collaborators.length === 1 ? "este comercio" : "estos comercios"}.
      </p>
      <ul className="mt-3 flex flex-col gap-2">
        {collaborators.map((comercio) => {
          const handle = comercio.handle?.replace(/^@/, "") ?? null;
          return (
            <li key={comercio.id}>
              <Link
                href={`/${encodeURIComponent(handle || comercio.id)}`}
                className="inline-flex max-w-full items-center gap-3 rounded-full pr-4 transition hover:bg-white/[0.04]"
                aria-label={`Ver el perfil de ${comercio.name}`}
              >
                <HostMark src={comercio.logoUrl} name={comercio.name} />
                <span className="min-w-0">
                  <span className="block truncate text-[15px] font-semibold tracking-tight">
                    {comercio.name}
                  </span>
                  <span className="block truncate text-[13px] text-white/45">
                    {handle ? `@${handle}` : "Ver perfil"}
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function HostMark({ src, name }: { src?: string | null; name: string }) {
  const initial = name.charAt(0).toUpperCase() || "A";
  return (
    <span className="relative size-11 shrink-0 overflow-hidden rounded-[12px] bg-black ring-1 ring-white/12">
      {src ? (
        <img src={src} alt="" className="absolute inset-0 size-full object-cover object-center" />
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
  const instagram = instagramLink(event.provider?.instagramUrl);
  const whatsapp = whatsappLink(event.provider?.phone);

  if (!when && !place && !instagram && !whatsapp) {
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
      {instagram ? (
        <MetaTile icon={<InstagramMark className="size-[18px]" />} label="Instagram" href={instagram.href}>
          {instagram.label}
        </MetaTile>
      ) : null}
      {whatsapp ? (
        <MetaTile
          icon={<WhatsAppMark className="size-[18px]" />}
          label="WhatsApp"
          href={whatsapp.href}
        >
          {whatsapp.label}
        </MetaTile>
      ) : null}
    </ul>
  );
}

export function EventDescription({ text }: { text: string | null }) {
  if (!text?.trim()) return null;
  return (
    <section>
      <SectionTitle>Sobre el evento</SectionTitle>
      <p className="whitespace-pre-line break-words text-[16px] leading-7 text-white/80 [overflow-wrap:anywhere]">
        {text}
      </p>
    </section>
  );
}

export function EntryTypesCard({
  types,
  previewEventId,
  priceCentsFor,
}: {
  types: EventEntryType[];
  /**
   * While the sale has not opened, each upcoming ticket links into the
   * reserve screen so the selection can be previewed. Reserving stays off.
   */
  previewEventId?: string;
  /**
   * What to print for a list price. Null while the buyer-facing quote is
   * still loading. Defaults to the list price itself.
   */
  priceCentsFor?: (listCents: number) => number | null;
}) {
  if (types.length === 0) return null;
  const now = Date.now();
  return (
    <section>
      <SectionTitle>Entradas</SectionTitle>
      <Card padding="none" className="divide-y divide-border">
        {types.map((type) => {
          const onSale = isEntryTypeOnSale(type, now);
          const soldOut = type.soldOut || type.remaining === 0;
          const upcoming = isEntryTypeUpcoming(type, now);
          const previewable = Boolean(previewEventId) && upcoming;
          const status = soldOut
            ? "Agotado"
            : !onSale && type.saleStartsAt && new Date(type.saleStartsAt).getTime() > now
              ? `A la venta desde ${formatDateTime(type.saleStartsAt)}`
              : !onSale
                ? "Venta cerrada"
                : type.remaining != null
                  ? `${type.remaining} disponibles`
                  : "Disponible";
          const row = (
            <>
              <div className="min-w-0">
                <p className="text-[15px] font-bold tracking-tight">{type.name}</p>
                <p className="mt-0.5 text-[13px] text-muted">{status}</p>
              </div>
              <p className="shrink-0 text-[17px] font-bold tabular-nums tracking-tight">
                <ListedPrice
                  cents={(priceCentsFor ?? ((cents) => cents))(type.priceCents)}
                />
              </p>
            </>
          );
          if (previewable && previewEventId) {
            return (
              <Link
                key={type.id}
                href={`/eventos/${encodeURIComponent(previewEventId)}/reservar?entrada=${encodeURIComponent(type.id)}`}
                className="flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-white/[0.04]"
              >
                {row}
              </Link>
            );
          }
          return (
            <div
              key={type.id}
              className={`flex items-center justify-between gap-4 px-5 py-4 ${soldOut || !onSale ? "opacity-60" : ""}`}
            >
              {row}
            </div>
          );
        })}
      </Card>
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
    <p className="flex items-start gap-2 text-[13px] text-dim">
      <Undo2 className="mt-0.5 size-4 shrink-0" aria-hidden /> {text}
    </p>
  );
}
