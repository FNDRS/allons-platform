"use client";

import type { TicketResourceSummary } from "@/lib/api/tickets";
import { Button } from "@/components/ui/Button";

/**
 * The unit already chosen at checkout. Picking happens before pay, so a
 * ticket never asks for it again.
 */
export function TicketResourceCard({
  group,
  onPick,
}: {
  group: TicketResourceSummary;
  onPick: () => void;
}) {
  if (!group.assigned) return null;
  const name = group.name.toLowerCase();
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/38">
        Tu {name}
      </p>
      <p className="text-[28px] font-bold leading-none tracking-[-0.04em] text-white sm:text-[34px]">
        {group.assigned.label}
      </p>
      <Button variant="glass" size="sm" onClick={onPick}>
        Cambiar
      </Button>
    </div>
  );
}
