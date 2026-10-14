"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/States";
import { useClassCoachActions, useClassCoaches } from "@/hooks/useClassCoaches";
import { useConfirm } from "@/hooks/useConfirm";
import type { ClassCoach } from "@/lib/api/classCoaches";
import { ClassCoachEditorModal } from "./ClassCoachEditorModal";
import { ClassCoachRow } from "./ClassCoachRow";

type Editing = { coach: ClassCoach | null } | null;

/** The comercio's coaches: add, edit, retire and bring back. */
export function ClassCoachesView() {
  const { coaches, activeCoaches, isLoading, error, refetch } = useClassCoaches();
  const actions = useClassCoachActions();
  const { confirm, dialog } = useConfirm();
  const [editing, setEditing] = useState<Editing>(null);

  const toggle = async (coach: ClassCoach) => {
    if (coach.active && coach.slotCount > 0) {
      const ok = await confirm(
        `Retirar a ${coach.name}`,
        `Tiene ${coach.slotCount} ${coach.slotCount === 1 ? "horario asignado" : "horarios asignados"}. Siguen mostrando su nombre hasta que les asignes otro coach desde Horario.`,
        "Retirar",
      );
      if (!ok) return;
    }
    actions.setActive(coach.id, !coach.active);
  };

  const newButton = (
    <Button size="sm" onClick={() => setEditing({ coach: null })}>
      <Plus className="size-4" aria-hidden />
      Agregar coach
    </Button>
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[13px] text-white/50">
          {isLoading || error ? " " : `${activeCoaches.length} activos`}
        </p>
        {newButton}
      </div>

      {isLoading ? (
        <Skeleton className="h-[240px] w-full rounded-[24px]" />
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : coaches.length === 0 ? (
        <EmptyState
          title="Aún no tienes coaches"
          body="Agrega a tu equipo para asignarlos a cada horario y verlos en el horario semanal."
          action={newButton}
        />
      ) : (
        <Card padding="none" className="divide-y divide-border">
          {coaches.map((coach) => (
            <ClassCoachRow
              key={coach.id}
              coach={coach}
              toggling={actions.togglingId === coach.id}
              onEdit={() => setEditing({ coach })}
              onToggleActive={() => void toggle(coach)}
            />
          ))}
        </Card>
      )}

      {editing ? (
        <ClassCoachEditorModal
          open
          coach={editing.coach}
          saving={actions.saving}
          onClose={() => setEditing(null)}
          onSave={async (body) => {
            const saved = await actions.save({ id: editing.coach?.id ?? null, body });
            if (saved) setEditing(null);
          }}
        />
      ) : null}
      {dialog}
    </div>
  );
}
