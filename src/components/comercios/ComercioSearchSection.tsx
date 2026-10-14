/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { ChevronRight, MapPin } from "lucide-react";
import {
  comercioHref,
  comercioInitials,
  formatCompactCount,
  type ComercioSearchResult,
} from "@/lib/api/comercios";
import { safeColor } from "@/components/events/EventCover";
import { SectionTitle } from "@/components/ui/Card";

/** Comercios that match the search, above the events. Hidden when none do. */
export function ComercioSearchSection({
  comercios,
}: {
  comercios: ComercioSearchResult[];
}) {
  if (comercios.length === 0) return null;

  return (
    <section className="mb-14">
      <SectionTitle>Comercios</SectionTitle>
      <ul className="grid min-w-0 grid-cols-1 gap-3 md:grid-cols-2">
        {comercios.map((comercio, index) => (
          <li
            key={comercio.id}
            className="rise min-w-0"
            style={{ "--i": index } as React.CSSProperties}
          >
            <ComercioRow comercio={comercio} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function ComercioRow({ comercio }: { comercio: ComercioSearchResult }) {
  const brand = safeColor(comercio.brandLogoColor) ?? "#f67010";
  const handle = comercio.handle ? `@${comercio.handle.replace(/^@/, "")}` : null;
  const followers = `${formatCompactCount(comercio.followerCount)} ${
    comercio.followerCount === 1 ? "seguidor" : "seguidores"
  }`;

  return (
    <Link
      href={comercioHref(comercio)}
      className="group flex min-w-0 items-center gap-4 rounded-[24px] border border-white/10 bg-white/[0.03] p-3 pr-4 transition-colors hover:border-white/20 hover:bg-white/[0.06]"
    >
      <span
        className="relative grid size-14 shrink-0 place-items-center overflow-hidden rounded-[18px] bg-white/[0.06] text-[18px] font-bold tracking-tight text-white ring-1 ring-white/15"
        style={comercio.logoUrl ? undefined : { backgroundColor: `${brand}33` }}
      >
        {comercio.logoUrl ? (
          <img
            src={comercio.logoUrl}
            alt=""
            className="absolute inset-0 size-full object-cover object-center"
          />
        ) : (
          comercioInitials(comercio.name)
        )}
      </span>

      <span className="min-w-0 flex-1">
        <span className="block truncate text-[16px] font-semibold tracking-tight text-white">
          {comercio.name}
        </span>
        <span className="mt-1 flex min-w-0 items-center gap-x-3 text-[13px] text-white/55">
          {handle ? <span className="truncate">{handle}</span> : null}
          {comercio.city ? (
            <span className="inline-flex min-w-0 items-center gap-1">
              <MapPin className="size-3.5 shrink-0 text-white/40" aria-hidden />
              <span className="truncate">{comercio.city}</span>
            </span>
          ) : null}
        </span>
        <span className="mt-0.5 block truncate text-[13px] text-white/40">{followers}</span>
      </span>

      <ChevronRight
        className="size-4 shrink-0 text-white/35 transition-transform group-hover:translate-x-0.5"
        aria-hidden
      />
    </Link>
  );
}
