"use client";

import type { PublicResourceGroup } from "@/lib/api/events";
import { ResourceGrid, studioFrontLabel } from "@/components/tickets/ResourceGrid";
import { StepHeading } from "./ReserveSections";

export function ReserveBikePicker({
  groups,
  selectedByGroup,
  quantity,
  step,
  error,
  onToggle,
}: {
  groups: PublicResourceGroup[];
  selectedByGroup: Record<string, string[]>;
  quantity: number;
  step: number;
  error?: string | null;
  onToggle: (groupId: string, resourceId: string) => void;
}) {
  if (groups.length === 0) return null;
  const hint =
    quantity <= 1
      ? "Toca una unidad libre. Toca otra para cambiar."
      : `Elige ${quantity} unidades libres`;

  return (
    <section>
      {groups.map((group) => {
        const mine = new Set(selectedByGroup[group.id] ?? []);
        return (
          <div key={group.id}>
            <StepHeading n={step}>
              Elige tu {group.name.toLowerCase()}
            </StepHeading>
            <div className="rounded-[26px] bg-white/[0.08] p-px">
              <div className="rounded-[25px] bg-[#0c0c0e] px-4 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] sm:px-5">
                <p className="mb-4 text-[13px] leading-5 text-white/45">
                  {group.description ?? hint}
                </p>
                <ResourceGrid
                  columns={group.columns}
                  frontLabel={studioFrontLabel(group.name)}
                  tiles={group.resources.map((unit) => ({
                    id: unit.id,
                    label: unit.label,
                    taken: unit.taken === true && !mine.has(unit.id),
                    mine: mine.has(unit.id),
                  }))}
                  onSelect={(tile) => {
                    if (tile.taken && !tile.mine) return;
                    onToggle(group.id, tile.id);
                  }}
                />
                <div className="mt-4 flex gap-4 text-[11px] text-white/40">
                  <Legend className="border-white/12 bg-white/[0.07]" label="Libre" />
                  <Legend className="border-transparent bg-white/[0.03]" label="Ocupada" />
                  <Legend className="border-accent bg-accent" label="Tuya" />
                </div>
                {error ? (
                  <p className="mt-3 text-sm text-red-300">{error}</p>
                ) : null}
              </div>
            </div>
          </div>
        );
      })}
    </section>
  );
}

function Legend({ className, label }: { className: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={`size-3 rounded-[4px] border ${className}`} aria-hidden />
      {label}
    </span>
  );
}
