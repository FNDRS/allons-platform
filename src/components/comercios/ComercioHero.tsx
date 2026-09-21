/* eslint-disable @next/next/no-img-element */

import { Globe, Mail, MapPin, Smartphone, Star } from "lucide-react";
import { comercioInitials, type ComercioProfile } from "@/lib/api/comercios";
import { safeColor } from "@/components/events/EventCover";
import { glassCtaClass } from "@/components/ui/cta";
import { ComercioStats } from "./ComercioStats";

/**
 * Identity block: a brand-tinted field with the logo, the name, where it is,
 * how it is rated, its counters and the ways to reach it.
 */
export function ComercioHero({
  profile,
  appDeepLink,
}: {
  profile: ComercioProfile;
  appDeepLink: string;
}) {
  const brand = safeColor(profile.brandLogoColor) ?? "#f67010";
  const handle = profile.handle ? `@${profile.handle.replace(/^@/, "")}` : null;
  const rating =
    profile.rating != null && profile.reviewCount > 0
      ? profile.rating.toFixed(1)
      : null;

  return (
    <header className="relative overflow-hidden rounded-[32px] border border-white/10 bg-black shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
      <span
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(90% 120% at 0% 0%, ${brand}66 0%, ${brand}22 38%, transparent 70%)`,
        }}
        aria-hidden
      />
      <span
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"
        aria-hidden
      />
      <span className="poster-grain" aria-hidden />

      <div className="relative flex flex-col gap-7 p-6 sm:p-9">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:gap-7">
          <span
            className="relative grid size-[88px] shrink-0 place-items-center overflow-hidden rounded-[26px] bg-white/[0.06] text-[30px] font-bold tracking-tight text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] ring-1 ring-white/15 backdrop-blur sm:size-[104px] sm:text-[36px]"
            style={profile.logoUrl ? undefined : { backgroundColor: `${brand}33` }}
          >
            {profile.logoUrl ? (
              <img
                src={profile.logoUrl}
                alt=""
                className="absolute inset-0 size-full object-cover object-center"
              />
            ) : (
              comercioInitials(profile.name)
            )}
          </span>

          <div className="min-w-0 flex-1">
            <h1 className="break-words text-[28px] font-bold leading-[1.02] tracking-[-0.04em] sm:text-[48px]">
              {profile.name}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[14px] text-white/65">
              {handle ? (
                <span className="rounded-full bg-white/[0.08] px-3 py-1 font-semibold text-white/85 ring-1 ring-white/10">
                  {handle}
                </span>
              ) : null}
              {profile.city ? (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="size-4 text-white/45" aria-hidden />
                  {profile.city}
                </span>
              ) : null}
              {rating ? (
                <span className="inline-flex items-center gap-1.5">
                  <Star className="size-4 fill-accent text-accent" aria-hidden />
                  <span className="font-semibold text-white">{rating}</span>
                  <span className="text-white/45">
                    · {profile.reviewCount}{" "}
                    {profile.reviewCount === 1 ? "reseña" : "reseñas"}
                  </span>
                </span>
              ) : null}
            </div>
          </div>
        </div>

        <ComercioStats profile={profile} />

        <div className="flex flex-wrap items-center gap-2.5">
          <a
            href={appDeepLink}
            className={`inline-flex h-11 items-center gap-2 px-5 text-sm ${glassCtaClass}`}
          >
            <Smartphone className="size-4" aria-hidden />
            Seguir en la app
          </a>
          {profile.websiteUrl ? (
            <a
              href={profile.websiteUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-11 items-center gap-2 rounded-full border border-white/12 bg-white/[0.06] px-5 text-sm font-semibold text-white/85 transition hover:bg-white/[0.12] hover:text-white"
            >
              <Globe className="size-4" aria-hidden />
              Sitio web
            </a>
          ) : null}
          {profile.email ? (
            <a
              href={`mailto:${profile.email}`}
              className="inline-flex h-11 items-center gap-2 rounded-full border border-white/12 bg-white/[0.06] px-5 text-sm font-semibold text-white/85 transition hover:bg-white/[0.12] hover:text-white"
            >
              <Mail className="size-4" aria-hidden />
              Escribir
            </a>
          ) : null}
        </div>
      </div>
    </header>
  );
}
