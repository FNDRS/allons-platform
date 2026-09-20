import Link from "next/link";
import { MapPin } from "lucide-react";
import { formatEventWhen } from "@/lib/allons-api";
import type { EventListItem } from "@/lib/api/events";
import { formatPriceCents } from "@/lib/format";
import { EventCover } from "./EventCover";

export function EventCard({ event }: { event: EventListItem }) {
  const when = formatEventWhen(event.startsAt);
  const soldOut = event.status === "sold_out";
  return (
    <Link
      href={`/events/${encodeURIComponent(event.id)}`}
      className="group flex flex-col overflow-hidden rounded-[24px] border border-white/[0.08] bg-white/[0.03] transition hover:border-white/[0.16] hover:bg-white/[0.05]"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <EventCover
          src={event.coverImageUrl}
          alt=""
          themeColor={event.themeColor}
          className="transition duration-500 group-hover:scale-[1.03]"
        />
        <span className="absolute left-3 top-3 rounded-full bg-black/60 px-3 py-1 text-[12px] font-bold backdrop-blur">
          {soldOut ? "Agotado" : formatPriceCents(event.minPriceCents)}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-4">
        {when ? (
          <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-accent">
            {when}
          </p>
        ) : null}
        <h3 className="mt-1.5 line-clamp-2 text-lg font-semibold leading-snug tracking-tight">
          {event.title}
        </h3>
        {event.city ? (
          <p className="mt-auto flex items-center gap-1.5 pt-3 text-sm text-white/50">
            <MapPin className="size-3.5" aria-hidden /> {event.city}
          </p>
        ) : null}
      </div>
    </Link>
  );
}
