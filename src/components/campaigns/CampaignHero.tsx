/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { CalendarDays } from "lucide-react";
import type { PublicCampaign } from "@/lib/api/campaigns";

const DATE = new Intl.DateTimeFormat("es-HN", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "America/Tegucigalpa",
});

/** Name, dates, who runs it and what it is about. */
export function CampaignHero({ campaign }: { campaign: PublicCampaign }) {
  const hubHref = campaign.hub.handle
    ? `/${encodeURIComponent(campaign.hub.handle)}`
    : null;
  return (
    <header className="relative w-full min-w-0 overflow-hidden rounded-[28px] border border-white/10 bg-black shadow-[0_30px_80px_rgba(0,0,0,0.45)] sm:rounded-[32px]">
      {campaign.coverImageUrl ? (
        <img
          src={campaign.coverImageUrl}
          alt=""
          className="absolute inset-0 size-full object-cover opacity-35"
        />
      ) : null}
      <span
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(90% 120% at 0% 0%, #f6701066 0%, #f6701022 38%, transparent 70%)",
        }}
        aria-hidden
      />
      <span className="poster-grain" aria-hidden />

      <div className="relative flex min-w-0 flex-col gap-4 p-5 sm:p-9">
        <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-white/55">
          Campaña
        </p>
        <h1 className="text-[32px] font-bold leading-tight tracking-tight text-white sm:text-[44px]">
          {campaign.name}
        </h1>
        <p className="inline-flex items-center gap-2 text-[14px] text-white/70">
          <CalendarDays className="size-4" aria-hidden />
          {DATE.format(new Date(campaign.startsAt))} al{" "}
          {DATE.format(new Date(campaign.endsAt))}
        </p>
        <p className="text-[14px] text-white/60">
          Organiza{" "}
          {hubHref ? (
            <Link href={hubHref} className="font-semibold text-white underline-offset-2 hover:underline">
              {campaign.hub.name}
            </Link>
          ) : (
            <span className="font-semibold text-white">{campaign.hub.name}</span>
          )}
        </p>
        {campaign.description ? (
          <p className="max-w-2xl whitespace-pre-line text-[15px] leading-7 text-white/70">
            {campaign.description}
          </p>
        ) : null}
      </div>
    </header>
  );
}
