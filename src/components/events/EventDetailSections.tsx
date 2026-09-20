"use client";

/* eslint-disable @next/next/no-img-element */

import { Calendar, ExternalLink, MapPin, Package, Undo2, Users } from "lucide-react";
import { formatEventWhen } from "@/lib/allons-api";
import {
  isEntryTypeOnSale,
  type EventDetail,
  type EventEntryType,
  type PublicResourceGroup,
} from "@/lib/api/events";
import { formatDateTime, formatPriceCents } from "@/lib/format";
import { Card, SectionTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/States";
import { ResourceGrid } from "@/components/tickets/ResourceGrid";
import { EventCover } from "./EventCover";

export function EventHero({ event }: { event: EventDetail }) {
  return (
    <div className="relative -mx-4 aspect-[4/3] overflow-hidden sm:mx-0 sm:aspect-[21/9] sm:rounded-[24px] sm:border sm:border-border">
      <EventCover src={event.coverImageUrl} alt="" themeColor={event.themeColor} />
      <div className="absolute inset-0 bg-gradient-to-t from-[#070708] via-[#070708]/40 to-transparent" aria-hidden />
      <div className="absolute inset-x-0 bottom-0 p-5 sm:p-8">
        <h1 className="max-w-3xl text-[34px] font-bold leading-[1.02] tracking-[-0.03em] sm:text-[52px]">
          {event.title}
        </h1>
      </div>
    </div>
  );
}

function MetaPill({ icon, children, href }: { icon: React.ReactNode; children: React.ReactNode; href?: string }) {
  const className =
    "inline-flex h-11 max-w-full items-center gap-2 rounded-full border border-border bg-surface px-4 text-[14px] font-semibold";
  if (href) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={`${className} transition hover:border-border-strong hover:bg-surface-2`}>
        <span className="text-accent">{icon}</span>
        <span className="truncate">{children}</span>
        <ExternalLink className="size-3.5 text-dim" aria-hidden />
      </a>
    );
  }
  return (
    <span className={className}>
      <span className="text-accent">{icon}</span>
      <span className="truncate">{children}</span>
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
  return (
    <div className="flex flex-wrap gap-2">
      {when ? <MetaPill icon={<Calendar className="size-4" aria-hidden />}>{when}</MetaPill> : null}
      {place ? (
        <MetaPill icon={<MapPin className="size-4" aria-hidden />} href={mapsUrl ?? undefined}>
          {[place, event.venue ? event.city : null].filter(Boolean).join(" · ")}
        </MetaPill>
      ) : null}
      {typeof event.attendeeCount === "number" && event.attendeeCount > 0 ? (
        <MetaPill icon={<Users className="size-4" aria-hidden />}>
          {event.attendeeCount} {event.attendeeCount === 1 ? "persona va" : "personas van"}
        </MetaPill>
      ) : null}
    </div>
  );
}

export function OrganizerCard({ event }: { event: EventDetail }) {
  const provider = event.provider;
  if (!provider?.name) return null;
  return (
    <section>
      <SectionTitle>Organiza</SectionTitle>
      <Card className="flex items-center gap-4">
        {provider.logoUrl ? (
          <img src={provider.logoUrl} alt="" className="size-12 rounded-full object-cover" />
        ) : (
          <span className="flex size-12 items-center justify-center rounded-full bg-accent-soft text-[15px] font-bold text-accent">
            {provider.name.charAt(0).toUpperCase()}
          </span>
        )}
        <div className="min-w-0">
          <p className="truncate text-[16px] font-bold tracking-tight">{provider.name}</p>
          {provider.handle ? <p className="truncate text-sm text-muted">@{provider.handle}</p> : null}
        </div>
      </Card>
    </section>
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
        {groups.map((group) => (
          <Card key={group.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[16px] font-bold tracking-tight">
                  Tu {group.name.toLowerCase()}
                </p>
                <p className="mt-0.5 text-[13px] text-muted">
                  {group.available} de {group.total} libres · se elige después de comprar
                </p>
                {group.description ? (
                  <p className="mt-2 text-sm text-white/70">{group.description}</p>
                ) : null}
              </div>
              <Badge tone={group.available > 0 ? "accent" : "danger"}>
                {group.available > 0 ? "Hay lugar" : "Sin lugar"}
              </Badge>
            </div>
            <div className="mt-4">
              <ResourceGrid
                compact
                columns={group.columns}
                tiles={group.resources.map((unit) => ({
                  id: unit.id,
                  label: unit.label,
                  taken: unit.taken,
                }))}
              />
            </div>
          </Card>
        ))}
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
