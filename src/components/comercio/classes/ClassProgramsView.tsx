"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { useProviderClassPrograms } from "@/hooks/useProviderClassPrograms";
import { buttonClass } from "@/components/ui/Button";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/States";
import { ClassProgramListCard } from "./ClassProgramListCard";

const NEW_HREF = "/comercio/clases/nueva";

/** The comercio's class programs, with a way to create one. */
export function ClassProgramsView() {
  const { programs, publishedCount, isLoading, error, refetch } = useProviderClassPrograms();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[13px] text-white/50">
          {isLoading || error
            ? " "
            : `${programs.length} ${programs.length === 1 ? "programa" : "programas"} · ${publishedCount} publicados`}
        </p>
        <Link href={NEW_HREF} className={buttonClass({ size: "sm" })}>
          <Plus className="size-4" aria-hidden />
          Crear programa
        </Link>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-[132px] w-full rounded-[24px]" />
          ))}
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : programs.length === 0 ? (
        <EmptyState
          title="Aún no tienes programas"
          body="Crea un programa para vender paquetes de sesiones y que tus clientes agenden sus clases."
          action={
            <Link href={NEW_HREF} className={buttonClass({ size: "sm" })}>
              <Plus className="size-4" aria-hidden />
              Crear programa
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {programs.map((program) => (
            <ClassProgramListCard key={program.id} program={program} />
          ))}
        </div>
      )}
    </div>
  );
}
