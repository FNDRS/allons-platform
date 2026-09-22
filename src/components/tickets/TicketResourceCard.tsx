"use client";

import type { TicketResourceSummary } from "@/lib/api/tickets";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

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
    <Card className="flex items-center justify-between gap-3 border-accent/30 bg-accent/[0.07] sm:gap-4">
      <div className="min-w-0">
        <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-accent">Tu {name}</p>
        <p className="mt-1 break-words text-[32px] font-bold leading-none tracking-[-0.03em] sm:text-[40px]">{group.assigned.label}</p>
      </div>
      <Button variant="glass" size="sm" onClick={onPick}>
        Cambiar
      </Button>
    </Card>
  );
}
