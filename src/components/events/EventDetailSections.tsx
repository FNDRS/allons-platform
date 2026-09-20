"use client";

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
    <div className="relative -mx-4 -mt-6 aspect-[4/3] overflow-hidden sm:mx-0 sm:mt-0 sm:aspect-[21/9] sm:rounded-[28px]">
      <EventCover src={event.coverImageUrl} alt="" themeColor={event.themeColor} />
      <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/30 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-5 sm:p-8">
        {event.provider?.name ? (
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">
            {event.provider.name}
          </p>
        ) : null}
        <h1 className="mt-2 text-3xl font-semibold leading-[1.02] tracking-[-0.05em] sm:text-5xl">
          {event.title}
        </h1>
      </div>
    </div>
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
  return (
    <Card className="grid gap-4 sm:grid-cols-2">
      {when ? (
        <div className="flex gap-3">
          <Calendar className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden />
          <div>
            <p className="font-semibold tracking-tight">{when}</p>
            {event.endsAt ? (
              <p className="text-sm text-white/50">Termina {formatDateTime(event.endsAt)}</p>
            ) : null}
          </div>
        </div>
      ) : null}
      {event.venue || event.address || event.city ? (
        <div className="flex gap-3">
          <MapPin className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden />
          <div className="min-w-0">
            <p className="font-semibold tracking-tight">{event.venue ?? event.city}</p>
            <p className="text-sm text-white/50">
              {[event.address, event.venue ? event.city : null].filter(Boolean).join(" · ")}
            </p>
            {mapsUrl ? (
              <a
                href={mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-accent"
              >
                Ver en el mapa <ExternalLink className="size-3.5" aria-hidden />
              </a>
            ) : null}
          </div>
        </div>
      ) : null}
      {typeof event.attendeeCount === "number" && event.attendeeCount > 0 ? (
        <div className="flex gap-3">
          <Users className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden />
          <p className="font-semibold tracking-tight">
            {event.attendeeCount} {event.attendeeCount === 1 ? "persona va" : "personas van"}
          </p>
        </div>
      ) : null}
    </Card>
  );
}

export function EventDescription({ text }: { text: string | null }) {
  if (!text?.trim()) return null;
  return (
    <section>
      <SectionTitle>Sobre el evento</SectionTitle>
      <p className="whitespace-pre-line text-[15px] leading-7 text-white/75">{text}</p>
    </section>
  );
}

export function EntryTypesCard({ types }: { types: EventEntryType[] }) {
  if (types.length === 0) return null;
  const now = Date.now();
  return (
    <section>
      <SectionTitle>Entradas</SectionTitle>
      <div className="flex flex-col gap-2.5">
        {types.map((type) => {
          const onSale = isEntryTypeOnSale(type, now);
          const soldOut = type.soldOut || type.remaining === 0;
          return (
            <Card key={type.id} className="flex items-center justify-between gap-4 py-4">
              <div className="min-w-0">
                <p className="font-semibold tracking-tight">{type.name}</p>
                <p className="mt-0.5 text-sm text-white/50">
                  {soldOut
                    ? "Agotado"
                    : !onSale && type.saleStartsAt && new Date(type.saleStartsAt).getTime() > now
                      ? `A la venta desde ${formatDateTime(type.saleStartsAt)}`
                      : !onSale
                        ? "Venta cerrada"
                        : type.remaining != null
                          ? `${type.remaining} disponibles`
                          : "Disponible"}
                </p>
              </div>
              <p className="shrink-0 text-lg font-bold tracking-tight">
                {formatPriceCents(type.priceCents)}
              </p>
            </Card>
          );
        })}
      </div>
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
                <p className="font-semibold tracking-tight">
                  Este evento asigna {group.name.toLowerCase()}
                </p>
                <p className="mt-0.5 text-sm text-white/50">
                  {group.available} de {group.total} libres
                  {group.required ? " · se elige después de comprar" : ""}
                </p>
                {group.description ? (
                  <p className="mt-2 text-sm text-white/60">{group.description}</p>
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
    <Card className="flex gap-3">
      <Package className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden />
      <div>
        <p className="font-semibold tracking-tight">Retiro de kit</p>
        <p className="mt-1 whitespace-pre-line text-sm leading-6 text-white/65">{info}</p>
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
    <p className="flex items-center gap-2 text-sm text-white/50">
      <Undo2 className="size-4" aria-hidden /> {text}
    </p>
  );
}
