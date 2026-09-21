import { Clock, Smartphone, User } from "lucide-react";
import type { ClassProgramPublic } from "@/lib/api/comercios";
import { formatHNL } from "@/lib/format";
import { EventCover } from "@/components/events/EventCover";

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

function fromPrice(program: ClassProgramPublic): string | null {
  const prices = program.packages
    .filter((pkg) => pkg.active && Number.isFinite(pkg.price))
    .map((pkg) => pkg.price);
  if (prices.length === 0) return null;
  return `Desde ${formatHNL(Math.min(...prices))}`;
}

/** One recurring class: cover, discipline, who teaches it, when, from how much. */
export function ClassProgramCard({
  program,
  appDeepLink,
}: {
  program: ClassProgramPublic;
  appDeepLink: string;
}) {
  const schedule = scheduleLabel(program);
  const price = fromPrice(program);
  const meta = [
    program.instructorName ? { Icon: User, text: program.instructorName } : null,
    program.durationMinutes ? { Icon: Clock, text: `${program.durationMinutes} min` } : null,
  ].filter(Boolean) as { Icon: typeof User; text: string }[];

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.03] transition hover:border-white/20 hover:bg-white/[0.05]">
      <div className="relative aspect-[16/10] overflow-hidden bg-[#1c1c1e]">
        <EventCover
          src={program.coverImageUrl}
          alt=""
          themeColor={program.themeColor}
          className="transition duration-700 group-hover:scale-[1.03]"
        />
        {program.discipline ? (
          <span className="absolute left-4 top-4 rounded-full bg-black/55 px-3 py-1 text-[11px] font-semibold tracking-tight text-white ring-1 ring-white/15 backdrop-blur-md">
            {program.discipline}
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <h3 className="text-[19px] font-semibold leading-tight tracking-[-0.02em]">
            {program.title}
          </h3>
          {schedule ? (
            <p className="mt-1.5 text-[13px] font-semibold uppercase tracking-[0.16em] text-accent">
              {schedule}
            </p>
          ) : null}
        </div>
        {meta.length > 0 ? (
          <ul className="flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-white/60">
            {meta.map(({ Icon, text }) => (
              <li key={text} className="inline-flex items-center gap-1.5">
                <Icon className="size-3.5 text-white/40" aria-hidden />
                {text}
              </li>
            ))}
          </ul>
        ) : null}
        <div className="mt-auto flex items-center justify-between gap-3 pt-2">
          <span className="text-[15px] font-bold tracking-tight">{price ?? ""}</span>
          <a
            href={appDeepLink}
            className="inline-flex h-9 items-center gap-1.5 rounded-full border border-white/12 bg-white/[0.06] px-3.5 text-[13px] font-semibold text-white/85 transition hover:bg-white/[0.12] hover:text-white"
          >
            <Smartphone className="size-3.5" aria-hidden />
            Reservar en la app
          </a>
        </div>
      </div>
    </article>
  );
}
