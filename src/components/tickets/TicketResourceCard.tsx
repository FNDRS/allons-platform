"use client";

import { Sparkles } from "lucide-react";
import type { TicketResourceSummary } from "@/lib/api/tickets";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/States";

/** "Tu bicicleta · B4" or the nudge to pick one. */
export function TicketResourceCard({
  group,
  onPick,
}: {
  group: TicketResourceSummary;
  onPick: () => void;
}) {
  const name = group.name.toLowerCase();
  if (group.assigned) {
    return (
      <Card className="flex items-center justify-between gap-4 border-accent/30 bg-accent/[0.07]">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-accent">Tu {name}</p>
          <p className="mt-1 text-[40px] font-bold leading-none tracking-[-0.03em]">{group.assigned.label}</p>
        </div>
        <Button variant="glass" size="sm" onClick={onPick}>
          Cambiar
        </Button>
      </Card>
    );
  }
  return (
    <Card className="flex flex-col gap-4 border-accent/40">
      <div className="flex items-start justify-between gap-3">
        <div className="flex gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
            <Sparkles className="size-4" aria-hidden />
          </span>
          <div>
            <p className="text-[16px] font-bold tracking-tight">Elige tu {name}</p>
            <p className="mt-0.5 text-sm text-muted">
              Este evento asigna una {name} por ticket. Escoge la tuya antes de llegar.
            </p>
          </div>
        </div>
        {group.required ? <Badge tone="warn">Falta elegir</Badge> : null}
      </div>
      <Button size="lg" full onClick={onPick}>
        Elegir {name}
      </Button>
    </Card>
  );
}
