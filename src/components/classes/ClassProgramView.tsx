"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useClassActions } from "@/hooks/useClassActions";
import { useClassProgram } from "@/hooks/useClassProgram";
import { isApiError } from "@/lib/api/client";
import { EmptyState, ErrorState } from "@/components/ui/States";
import { buttonClass } from "@/components/ui/Button";
import { ClassBalanceCard } from "./ClassBalanceCard";
import { ClassCancellationPolicy } from "./ClassCancellationPolicy";
import { ClassDescription } from "./ClassDescription";
import { ClassPackageList } from "./ClassPackageList";
import { ClassProgramHero } from "./ClassProgramHero";
import { ClassProgramMeta } from "./ClassProgramMeta";
import { ClassProgramSkeleton } from "./ClassProgramSkeleton";
import { ClassSchedule } from "./ClassSchedule";

function scrollToSchedule() {
  document.getElementById("agenda")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

/** A recurring class: what it is, its packages, and the week's sessions to book. */
export function ClassProgramView({ programId }: { programId: string }) {
  const state = useClassProgram(programId);
  const actions = useClassActions({
    programId,
    signedIn: state.signedIn,
    onSessionsGranted: scrollToSchedule,
  });

  if (state.loading) return <ClassProgramSkeleton />;
  if (state.error && isApiError(state.error) && state.error.status === 404) {
    return (
      <EmptyState
        title="Esta clase ya no está disponible"
        action={
          <Link href="/eventos" className={buttonClass({ variant: "secondary" })}>
            Ver eventos y clases
          </Link>
        }
      />
    );
  }
  if (state.error || !state.program) {
    return <ErrorState message={state.error?.message} onRetry={state.refetch} />;
  }

  const program = state.program;

  return (
    <div className="flex flex-col gap-8">
      <Link
        href="/eventos"
        className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-muted hover:text-white"
      >
        <ArrowLeft className="size-4" aria-hidden /> Eventos y clases
      </Link>

      <ClassProgramHero program={program} comercio={state.comercio} />
      <ClassProgramMeta program={program} />
      <ClassDescription text={program.description} />

      {state.balance && state.hasSessions ? <ClassBalanceCard balance={state.balance} /> : null}

      <ClassPackageList
        packages={state.packages}
        hasSessions={state.hasSessions}
        claimingPackageId={actions.claimingPackageId}
        onChoose={(item) => void actions.choosePackage(item)}
      />

      <ClassSchedule
        days={state.days}
        activeDate={state.activeDate}
        onSelectDate={state.selectDate}
        occurrences={state.dayOccurrences}
        loading={state.availabilityLoading}
        error={state.availabilityError}
        onRetry={state.refetchAvailability}
        signedIn={state.signedIn}
        hasSessions={state.hasSessions}
        reservingKey={actions.reservingKey}
        onReserve={(occurrence) => void actions.reserveOccurrence(occurrence)}
      />

      <ClassCancellationPolicy program={program} />
    </div>
  );
}
