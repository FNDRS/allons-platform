/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import type { ClassProgram } from "@/lib/api/classPrograms";
import type { ComercioProfile } from "@/lib/api/comercios";
import { EventCover, EventPosterWash } from "@/components/events/EventCover";
import { StatusPill } from "@/components/ui/Pill";

/** Cover, title and the comercio that teaches it. */
export function ClassProgramHero({
  program,
  comercio,
}: {
  program: ClassProgram;
  comercio: ComercioProfile | null;
}) {
  const slug = comercio ? comercio.handle?.replace(/^@/, "") || comercio.id : null;
  return (
    <header className="flex flex-col gap-5">
      <div className="overflow-hidden rounded-[28px] bg-black p-[5px] shadow-[0_24px_50px_rgba(0,0,0,0.35)]">
        <div className="relative aspect-video overflow-hidden rounded-[23px] bg-[#1c1c1e]">
          {program.coverImageUrl ? (
            <EventCover
              src={program.coverImageUrl}
              alt={`Portada de ${program.title}`}
              themeColor={program.themeColor}
            />
          ) : (
            <EventPosterWash themeColor={program.themeColor} />
          )}
          {program.discipline ? (
            <span className="absolute left-4 top-4">
              <StatusPill tone="glass">{program.discipline}</StatusPill>
            </span>
          ) : null}
        </div>
      </div>
      <div>
        <h1 className="break-words text-[28px] font-bold leading-[1.05] tracking-[-0.03em] sm:text-[36px]">
          {program.title}
        </h1>
        {comercio && slug ? (
          <Link
            href={`/${encodeURIComponent(slug)}`}
            className="mt-4 inline-flex max-w-full items-center gap-3 rounded-full pr-4 transition hover:bg-white/[0.04]"
            aria-label={`Ver el perfil de ${comercio.name}`}
          >
            <span className="relative size-11 shrink-0 overflow-hidden rounded-[12px] bg-black ring-1 ring-white/12">
              {comercio.logoUrl ? (
                <img src={comercio.logoUrl} alt="" className="absolute inset-0 size-full object-cover" />
              ) : (
                <span className="grid h-full w-full place-items-center text-sm font-bold text-accent">
                  {comercio.name.charAt(0).toUpperCase()}
                </span>
              )}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-[15px] font-semibold tracking-tight">
                {comercio.name}
              </span>
              <span className="block truncate text-[13px] text-white/45">
                {comercio.handle ? `@${comercio.handle.replace(/^@/, "")}` : "Ver perfil"}
              </span>
            </span>
          </Link>
        ) : null}
      </div>
    </header>
  );
}
