import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Progress } from "@/components/ui/Stat";
import { formatHNL, formatNumber } from "@/lib/format";
import type { ProviderClassProgram } from "@/lib/api/providerClassPrograms";
import { ClassProgramStatusPill } from "./ClassProgramStatusPill";
import { scheduleSummary } from "./classProgramFormat";

function activityLabel(sold: number, upcoming: number) {
  if (sold === 0 && upcoming === 0) return "Aún no hay reservas";
  if (upcoming > 0) return `${formatNumber(sold)} vendidas · ${formatNumber(upcoming)} próximas`;
  return `${formatNumber(sold)} vendidas`;
}

/** One class program in the list: schedule, status, occupancy and revenue. */
export function ClassProgramListCard({ program }: { program: ProviderClassProgram }) {
  const { metrics } = program;
  const hasPackages = program.packages.some((item) => item.active);
  const meta = [
    program.discipline,
    `${program.durationMinutes} min`,
    scheduleSummary(program),
    hasPackages ? null : "Sin paquetes",
  ]
    .filter(Boolean)
    .join(" · ");
  const occupancy = metrics.avgOccupancy == null ? 0 : Math.round(metrics.avgOccupancy * 100);

  return (
    <Link href={`/comercio/clases/${encodeURIComponent(program.id)}`} className="block">
      <Card interactive className="flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <p className="line-clamp-2 text-[16px] font-semibold tracking-tight">{program.title}</p>
            <p className="mt-0.5 truncate text-[13px] text-white/50">{meta}</p>
          </div>
          <ClassProgramStatusPill status={program.status} />
          <ChevronRight className="mt-1.5 size-4 shrink-0 text-white/30" aria-hidden />
        </div>
        <div className="flex items-end gap-4">
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <Progress value={occupancy} max={100} />
            <p className="truncate text-[12px] text-white/50">
              {activityLabel(metrics.soldSessions, metrics.upcomingReservations)}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
              Ingresos
            </p>
            <p className="text-[15px] font-semibold tabular-nums">
              {formatHNL(metrics.revenueCents / 100)}
            </p>
          </div>
        </div>
      </Card>
    </Link>
  );
}
