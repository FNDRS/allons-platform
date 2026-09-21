import Link from "next/link";
import { MapPin } from "lucide-react";
import { formatEventWhen } from "@/lib/allons-api";
import type { EventListItem } from "@/lib/api/events";
import { formatPriceCents } from "@/lib/format";
import { EventCover } from "./EventCover";

/**
 * Full-bleed cover with a bottom scrim carrying the copy, and a price pill
 * top right. One block per event, nothing outside the image.
 */
export function EventCard({ event }: { event: EventListItem }) {
  const when = formatEventWhen(event.startsAt);
  const soldOut = event.status === "sold_out";
  return (
    <Link
      href={`/events/${encodeURIComponent(event.id)}`}
      className="group relative block aspect-[4/5] overflow-hidden rounded-[18px] border border-border bg-surface transition duration-200 hover:border-border-strong"
    >
      <EventCover
        src={event.coverImageUrl}
        alt=""
        themeColor={event.themeColor}
        className="transition duration-700 ease-out group-hover:scale-[1.04]"
      />
      <div
        className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/5"
        aria-hidden
      />
      <span
        className={`glass absolute right-3 top-3 rounded-full border border-border-strong px-3 py-1.5 text-[12px] font-bold ${
          soldOut ? "text-muted" : "text-white"
        }`}
      >
        {soldOut ? "Agotado" : formatPriceCents(event.minPriceCents)}
      </span>
      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-1.5 p-5">
        {when ? (
          <p className="text-[12px] font-bold uppercase tracking-[0.16em] text-accent">{when}</p>
        ) : null}
        <h3 className="line-clamp-2 text-[22px] font-bold leading-[1.1] tracking-[-0.02em]">
          {event.title}
        </h3>
        {event.city ? (
          <p className="flex items-center gap-1.5 text-[13px] font-medium text-white/70">
            <MapPin className="size-3.5" aria-hidden /> {event.city}
          </p>
        ) : null}
      </div>
    </Link>
  );
}
