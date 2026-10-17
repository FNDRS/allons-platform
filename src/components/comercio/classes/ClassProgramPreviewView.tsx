"use client";

import Link from "next/link";
import { ArrowLeft, Eye } from "lucide-react";
import { toast } from "sonner";
import { useClassProgramPreview } from "@/hooks/useClassProgramPreview";
import { ErrorState, Skeleton } from "@/components/ui/States";
import { ClassCancellationPolicy } from "@/components/classes/ClassCancellationPolicy";
import { ClassDescription } from "@/components/classes/ClassDescription";
import { ClassPackageList } from "@/components/classes/ClassPackageList";
import { ClassProgramHero } from "@/components/classes/ClassProgramHero";
import { ClassProgramMeta } from "@/components/classes/ClassProgramMeta";
import { ClassSchedule } from "@/components/classes/ClassSchedule";

const previewOnly = () => toast("Es una vista previa. Tus clientes podrán comprar y reservar aquí.");

/** The comercio's class as its customers will see it, with buying and booking switched off. */
export function ClassProgramPreviewView({ id }: { id: string }) {
  const p = useClassProgramPreview(id);

  if (p.isLoading) return <Skeleton className="h-[420px] w-full rounded-[28px]" />;
  if (!p.program) {
    return <ErrorState message={p.error ?? "No se pudo cargar este programa."} onRetry={p.refetch} />;
  }

  const { program } = p;

  return (
    // Same width as the public class page, so the preview matches what customers get.
    <div className="mx-auto flex w-full max-w-[720px] flex-col gap-8">
      <Link
        href={`/comercio/clases/${encodeURIComponent(program.id)}`}
        className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-muted hover:text-white"
      >
        <ArrowLeft className="size-4" aria-hidden /> Volver al programa
      </Link>

      <div className="flex items-start gap-3 rounded-[18px] border border-accent/40 bg-accent/10 px-4 py-3 text-[13px] text-white/80">
        <Eye className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
        <p>
          Vista previa: así verán tus clientes esta clase.
          {program.status === "draft"
            ? " Es un borrador, así que solo tu equipo puede verla."
            : program.status === "pending_review"
              ? " La estamos revisando, así que solo tu equipo puede verla por ahora."
              : program.status === "rejected"
                ? " No fue aprobada, así que solo tu equipo puede verla."
                : program.status === "archived"
                  ? " Está archivada, así que solo tu equipo puede verla."
                  : null}
        </p>
      </div>

      <ClassProgramHero program={program} comercio={p.comercio} />
      <ClassProgramMeta program={program} />
      <ClassDescription text={program.description} />

      <ClassPackageList
        packages={p.packages}
        hasSessions={false}
        claimingPackageId={null}
        onChoose={previewOnly}
      />

      <ClassSchedule
        days={p.days}
        activeDate={p.activeDate}
        onSelectDate={p.selectDate}
        occurrences={p.dayOccurrences}
        loading={false}
        error={null}
        onRetry={p.refetch}
        signedIn={false}
        hasSessions={false}
        reservingKey={null}
        onReserve={previewOnly}
      />

      <ClassCancellationPolicy program={program} />
    </div>
  );
}
