import { Button } from "@/components/ui/Button";
import { StatusPill } from "@/components/ui/Pill";
import type { ClassCoach } from "@/lib/api/classCoaches";

/** One coach: name, bio, how many slots it runs, and its actions. */
export function ClassCoachRow({
  coach,
  toggling,
  onEdit,
  onToggleActive,
}: {
  coach: ClassCoach;
  toggling: boolean;
  onEdit: () => void;
  onToggleActive: () => void;
}) {
  const slots = `${coach.slotCount} ${coach.slotCount === 1 ? "horario" : "horarios"}`;
  return (
    <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-[15px] font-semibold tracking-tight">{coach.name}</p>
          {coach.active ? null : <StatusPill tone="mute">Retirado</StatusPill>}
        </div>
        <p className="mt-0.5 line-clamp-2 text-[13px] text-white/50">
          {[slots, coach.bio].filter(Boolean).join(" · ")}
        </p>
      </div>
      <div className="flex shrink-0 gap-2">
        <Button variant="secondary" size="sm" onClick={onEdit}>
          Editar
        </Button>
        <Button variant={coach.active ? "ghost" : "secondary"} size="sm" loading={toggling} onClick={onToggleActive}>
          {coach.active ? "Retirar" : "Reactivar"}
        </Button>
      </div>
    </div>
  );
}
