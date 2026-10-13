"use client";

import { useProviderClassProgram } from "@/hooks/useProviderClassProgram";
import { ErrorState, Skeleton } from "@/components/ui/States";
import { ClassProgramForm } from "./ClassProgramForm";

function EditExisting({ id }: { id: string }) {
  const { program, isLoading, error, refetch } = useProviderClassProgram(id);
  if (isLoading) return <Skeleton className="h-[520px] w-full max-w-3xl rounded-[28px]" />;
  if (!program) {
    return (
      <ErrorState
        message={error ?? "Puede que ya no exista. Vuelve a la lista e inténtalo de nuevo."}
        onRetry={refetch}
      />
    );
  }
  return <ClassProgramForm program={program} />;
}

/** Create a class program, or edit one once it has loaded. */
export function ClassProgramEditor({ id }: { id?: string }) {
  return id ? <EditExisting id={id} /> : <ClassProgramForm program={null} />;
}
