"use client";

import Link from "next/link";
import { formatEventWhen } from "@/lib/allons-api";
import type { EventDetail, EventEntryType } from "@/lib/api/events";
import { formatCardTime, formatDateTime } from "@/lib/format";
import { placeLabelOf, placeMapsUrl } from "@/lib/googleMapsLink";
import { buttonClass } from "@/components/ui/Button";
import { ListedPrice } from "@/components/ui/ListedPrice";
import { PaymentsPausedButton } from "@/components/ui/PaymentsPaused";
import { PAYMENTS_OUTAGE } from "@/lib/paymentsOutage";
import { CalendarMark, MetaTile, PinMark } from "@/components/ui/MetaTile";
import { Modal } from "@/components/ui/Modal";

const HN_DAY: Intl.DateTimeFormatOptions = {
  timeZone: "America/Tegucigalpa",
  year: "numeric",
  month: "numeric",
  day: "numeric",
};

function sameHnDay(a: string, b: string) {
  return (
    new Date(a).toLocaleDateString("es-HN", HN_DAY) ===
    new Date(b).toLocaleDateString("es-HN", HN_DAY)
  );
}

/** "Jueves, 29 de octubre, 7:00 p. m. a 10:00 p. m.", or both full dates across days. */
function sessionWhen(startsAt: string | null, endsAt: string | null): string | null {
  const start = formatEventWhen(startsAt);
  if (!start || !startsAt) return null;
  if (!endsAt || Number.isNaN(new Date(endsAt).getTime())) return start;
  const end = sameHnDay(startsAt, endsAt) ? formatCardTime(endsAt) : formatEventWhen(endsAt);
  return end ? `${start} a ${end}` : start;
}

/** What a session row prints under its name: its own date and venue, when it has them. */
export function sessionSubtitle(type: EventEntryType): string | null {
  const parts = [formatDateTime(type.startsAt), type.venue?.trim() || null].filter(Boolean);
  return parts.length ? parts.join(" · ") : null;
}

/**
 * One session of a bundle event, like a small event page: when, where and
 * what it is. Anything the session leaves empty falls back to the event.
 */
export function EntryTypeSessionModal({
  event,
  type,
  priceCents,
  reserveHref,
  onClose,
}: {
  event: EventDetail;
  type: EventEntryType | null;
  /** Buyer-facing price, null while the quote loads. */
  priceCents: number | null;
  /** Where the CTA goes. Null hides it (sold out, sale closed). */
  reserveHref: string | null;
  onClose: () => void;
}) {
  if (!type) return null;
  const startsAt = type.startsAt ?? event.startsAt;
  const endsAt = type.startsAt ? (type.endsAt ?? null) : event.endsAt;
  const when = sessionWhen(startsAt, endsAt);
  // The place goes as a whole, like the API's tickets do: never one
  // session's name with the event's map.
  const ownPlace = type.venue != null || type.address != null || type.latitude != null;
  const place = ownPlace
    ? {
        venue: type.venue ?? null,
        address: type.address ?? null,
        city: event.city,
        latitude: type.latitude ?? null,
        longitude: type.longitude ?? null,
      }
    : event;
  const placeLabel = placeLabelOf(place);
  const address = place.venue && place.address !== place.venue ? place.address : null;
  const description = type.description?.trim();

  return (
    <Modal
      open
      onClose={onClose}
      title={type.name}
      footer={
        reserveHref && PAYMENTS_OUTAGE && priceCents !== 0 ? (
          <PaymentsPausedButton className="w-full" />
        ) : reserveHref ? (
          <Link href={reserveHref} className={buttonClass({ size: "lg", full: true })}>
            Reservar esta entrada
          </Link>
        ) : null
      }
    >
      <div className="flex flex-col gap-5">
        <p className="text-[22px] font-bold tabular-nums tracking-tight">
          <ListedPrice cents={priceCents} />
        </p>
        {when || placeLabel ? (
          <ul className="flex flex-col gap-2">
            {when ? (
              <MetaTile icon={<CalendarMark />} label="Cuándo">
                {when}
              </MetaTile>
            ) : null}
            {placeLabel ? (
              <MetaTile icon={<PinMark />} label="Dónde" href={placeMapsUrl(place)}>
                {placeLabel}
                {address ? (
                  <span className="mt-0.5 block text-[13px] font-normal text-muted">
                    {address}
                  </span>
                ) : null}
              </MetaTile>
            ) : null}
          </ul>
        ) : null}
        {description ? (
          <p className="whitespace-pre-line break-words text-[15px] leading-7 text-white/80 [overflow-wrap:anywhere]">
            {description}
          </p>
        ) : null}
      </div>
    </Modal>
  );
}
