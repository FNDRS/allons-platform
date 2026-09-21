/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { Link2, MapPin } from "lucide-react";
import { formatEventWhen } from "@/lib/allons-api";
import type { EventListItem } from "@/lib/api/events";
import { formatPriceCents } from "@/lib/format";
import { EventPosterWash } from "./EventCover";
import { EventHoverVideo } from "./EventHoverVideo";

const HOVER_VIDEO_BY_HANDLE: Record<string, string> = {
  kinetix: "/providers/kinetix-hover.mp4",
};

/** Portrait phone frame. Cover is the comercio color wash; identity stays on top. */
export function EventCard({ event }: { event: EventListItem }) {
  const when = formatEventWhen(event.startsAt);
  const soldOut = event.status === "sold_out";
  const provider = event.provider;
  const handle = provider?.handle
    ? `@${provider.handle.replace(/^@/, "")}`
    : null;
  const avatarName = (provider?.name ?? event.title).trim();
  const cta = soldOut ? "Agotado" : formatPriceCents(event.minPriceCents);
  const place = event.city?.trim() || null;
  const site = displayHost(provider?.websiteUrl);
  const hoverSrc = provider?.handle
    ? HOVER_VIDEO_BY_HANDLE[provider.handle.replace(/^@/, "")]
    : undefined;

  return (
    <Link
      href={`/eventos/${encodeURIComponent(event.id)}`}
      className="group block h-full w-full"
    >
      <article className="event-phone flex aspect-square flex-col overflow-hidden rounded-[38px] bg-black p-[6px] shadow-[0_28px_60px_rgba(0,0,0,0.35)]">
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[32px] bg-[#1c1c1e]">
          <div className="relative min-h-0 flex-[1.7] overflow-hidden rounded-b-[26px]">
            <EventPosterWash
              themeColor={event.themeColor}
              className="event-phone-poster"
            />
            {hoverSrc ? <EventHoverVideo src={hoverSrc} /> : null}
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 h-[70%] bg-gradient-to-t from-black from-[18%] via-black/75 via-45% to-transparent"
              aria-hidden
            />
            <div className="absolute inset-x-0 bottom-0 z-10 flex items-end gap-2.5 px-3.5 pb-3.5 pt-10">
              <EventAvatar src={provider?.logoUrl} name={avatarName} />
              <div className="min-w-0 flex-1">
                <h3 className="line-clamp-2 text-[15px] font-semibold leading-tight tracking-tight text-white">
                  {event.title}
                </h3>
                <div className="mt-1 flex items-center gap-1.5">
                  {handle ? (
                    <p className="min-w-0 truncate text-[12px] text-white/45">
                      {handle}
                    </p>
                  ) : null}
                  <span
                    className={`ml-auto shrink-0 whitespace-nowrap rounded-full px-3 py-1 text-[12px] font-semibold tracking-tight ${
                      soldOut
                        ? "bg-white/10 text-white/40"
                        : "bg-white/12 text-white"
                    }`}
                  >
                    {cta}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex h-[64px] flex-none flex-col justify-center px-4">
            {when ? (
              <p className="line-clamp-2 text-[13px] leading-snug text-white/70">
                {when}
              </p>
            ) : null}
            {place ? (
              <p
                className={`flex items-center gap-1.5 text-[12px] font-medium text-accent ${
                  when ? "mt-1.5" : ""
                }`}
              >
                <MapPin className="size-3.5 shrink-0" aria-hidden />
                <span className="truncate">{place}</span>
              </p>
            ) : site ? (
              <p
                className={`flex items-center gap-1.5 text-[12px] font-medium text-accent ${
                  when ? "mt-1.5" : ""
                }`}
              >
                <Link2 className="size-3.5 shrink-0" aria-hidden />
                <span className="truncate">{site}</span>
              </p>
            ) : null}
          </div>
        </div>
      </article>
    </Link>
  );
}

function EventAvatar({ src, name }: { src?: string | null; name: string }) {
  const initial = name.charAt(0).toUpperCase() || "A";
  return (
    <span className="relative size-12 shrink-0 overflow-hidden rounded-[14px] bg-black shadow-[0_8px_18px_rgba(0,0,0,0.28)] ring-1 ring-white/15">
      {src ? (
        <img src={src} alt="" className="h-full w-full object-cover" />
      ) : (
        <span className="grid h-full w-full place-items-center text-lg font-bold text-accent">
          {initial}
        </span>
      )}
    </span>
  );
}

function displayHost(url?: string | null): string | null {
  if (!url?.trim()) return null;
  try {
    const parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
    return parsed.hostname.replace(/^www\./, "");
  } catch {
    return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
  }
}
