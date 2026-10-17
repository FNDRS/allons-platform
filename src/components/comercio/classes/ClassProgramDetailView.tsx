"use client";

import { useProviderClassProgram } from "@/hooks/useProviderClassProgram";
import { ErrorState, Skeleton } from "@/components/ui/States";
import { ComercioPageHeader } from "@/components/comercio/ComercioPageHeader";
import { ReviewStatusBanner } from "@/components/comercio/ReviewStatusBanner";
import { ClassProgramActions } from "./ClassProgramActions";
import { ClassProgramInfo } from "./ClassProgramInfo";
import { ClassProgramMetrics } from "./ClassProgramMetrics";
import { ClassProgramPackagesSummary } from "./ClassProgramPackagesSummary";
import { ClassProgramScheduleSummary } from "./ClassProgramScheduleSummary";
import { ClassProgramStatusPill } from "./ClassProgramStatusPill";

/** One class program: its numbers, schedule, packages and actions. */
export function ClassProgramDetailView({ id }: { id: string }) {
  const p = useProviderClassProgram(id);

  if (p.isLoading) return <Skeleton className="h-[420px] w-full rounded-[28px]" />;
  if (!p.program) {
    return <ErrorState message={p.error ?? "No se pudo cargar este programa."} onRetry={p.refetch} />;
  }

  const { program } = p;
  const meta = [program.discipline, `${program.durationMinutes} min`, `${program.capacityPerSession} cupos`]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="mb-3">
          <ClassProgramStatusPill status={program.status} />
        </div>
        <ComercioPageHeader title={program.title} subtitle={meta} />
        <ClassProgramActions
          program={program}
          busy={p.busy}
          onChangeStatus={p.changeStatus}
          onDelete={p.remove}
        />
      </div>
      <ReviewStatusBanner
        kind="clase"
        status={program.status}
        rejectReason={program.reviewRejectReason}
        editHref={`/comercio/clases/${encodeURIComponent(program.id)}/editar`}
      />
      <ClassProgramMetrics metrics={program.metrics} />
      <ClassProgramInfo program={program} />
      <div className="grid gap-6 lg:grid-cols-2">
        <ClassProgramScheduleSummary templates={program.sessionTemplates} />
        <ClassProgramPackagesSummary packages={program.packages} />
      </div>
    </div>
  );
}
