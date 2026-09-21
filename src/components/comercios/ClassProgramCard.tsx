import type { ReactNode } from "react";
import { ArrowUpRight, Building2, CalendarDays, Clock, User } from "lucide-react";
import type { ClassProgramPublic } from "@/lib/api/comercios";
import { formatHNL } from "@/lib/format";
import { EventCover, EventPosterWash } from "@/components/events/EventCover";
import { StatusPill } from "@/components/ui/Pill";
import { glassCtaClass } from "@/components/ui/cta";

const WEEKDAYS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

/** "Lun · Mié 17:30" from the active session templates. */
function scheduleLabel(program: ClassProgramPublic): string | null {
  const active = program.sessionTemplates.filter((template) => template.active);
  if (active.length === 0) return null;
  const days = [...new Set(active.map((template) => template.weekday))]
    .sort((a, b) => a - b)
    .map((day) => WEEKDAYS[day] ?? "")
    .filter(Boolean);
  const times = [...new Set(active.map((template) => template.startTime))];
  const time = times.length === 1 ? ` ${times[0]}` : "";
  return `${days.join(" · ")}${time}`;
}

function priceLabel(program: ClassProgramPublic): string | null {
  const prices = program.packages
    .filter((pkg) => pkg.active && Number.isFinite(pkg.price))
    .map((pkg) => pkg.price);
  if (prices.length === 0) return null;
  const lowest = Math.min(...prices);
  if (lowest <= 0) return "Gratis";
  return formatHNL(lowest);
}

/** Overlay class card: same poster language as the event listing. */
export function ClassProgramCard({
  program,
  appDeepLink,
}: {
  program: ClassProgramPublic;
  appDeepLink: string;
}) {
  const schedule = scheduleLabel(program);
  const price = priceLabel(program);
  const place = [program.locationName, program.city].filter(Boolean).join(", ");

  return (
    <a href={appDeepLink} className="group block h-full w-full">
      <article className="event-phone relative flex aspect-[4/4.2] flex-col overflow-hidden rounded-[32px] border border-white/10 bg-black shadow-[0_24px_50px_rgba(0,0,0,0.38)]">
        <div className="absolute inset-0">
          {program.coverImageUrl ? (
            <EventCover
              src={program.coverImageUrl}
              alt=""
              themeColor={program.themeColor}
              className="event-phone-poster"
            />
          ) : (
            <EventPosterWash
              themeColor={program.themeColor}
              className="event-phone-poster"
            />
          )}
        </div>
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[68%] bg-gradient-to-t from-black from-[16%] via-black/72 via-46% to-transparent"
          aria-hidden
        />

        {program.discipline ? (
          <span className="absolute left-4 top-4 z-10">
            <StatusPill tone="glass">{program.discipline}</StatusPill>
          </span>
        ) : null}

        <div className="relative z-10 mt-auto flex flex-col px-5 pb-5 pt-12">
          <h3 className="line-clamp-2 text-[22px] font-semibold leading-[1.12] tracking-[-0.03em] text-white">
            {program.title}
          </h3>
          {place ? (
            <p className="mt-1.5 flex items-center gap-1.5 text-[13px] font-medium text-white/78">
              <Building2 className="size-3.5 shrink-0" aria-hidden />
              <span className="truncate">{place}</span>
            </p>
          ) : null}

          <div className="mt-2.5 flex flex-wrap items-center gap-x-3.5 gap-y-1 text-[13px] font-medium text-white/78">
            {schedule ? (
              <Stat icon={<CalendarDays className="size-3.5" />}>{schedule}</Stat>
            ) : null}
            {program.instructorName ? (
              <Stat icon={<User className="size-3.5" />}>{program.instructorName}</Stat>
            ) : null}
            {program.durationMinutes ? (
              <Stat icon={<Clock className="size-3.5" />}>
                {program.durationMinutes} min
              </Stat>
            ) : null}
          </div>

          <div className="mt-4 flex items-center gap-3">
            {price ? (
              <p className="min-w-0 shrink-0 whitespace-nowrap text-[15px] font-semibold tracking-tight tabular-nums text-white">
                {price}
              </p>
            ) : null}
            <span
              className={`inline-flex h-11 min-w-0 flex-1 items-center justify-center gap-1.5 whitespace-nowrap text-[13px] ${glassCtaClass}`}
            >
              Reservar
              <ArrowUpRight
                className="size-3.5 text-white/45 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-white/70"
                strokeWidth={1.5}
                aria-hidden
              />
            </span>
          </div>
        </div>
      </article>
    </a>
  );
}

function Stat({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <span className="inline-flex min-w-0 items-center gap-1.5">
      <span className="shrink-0 text-white/70">{icon}</span>
      <span className="truncate">{children}</span>
    </span>
  );
}
