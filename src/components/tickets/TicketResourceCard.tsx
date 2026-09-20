"use client";

import { Sparkles } from "lucide-react";
import type { TicketResourceSummary } from "@/lib/api/tickets";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/States";

/** "Tu bicicleta: B4" or the nudge to pick one. */
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
      <Card className="flex items-center justify-between gap-4 border-accent/30 bg-accent/[0.06]">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-accent">
            Tu {name}
          </p>
          <p className="mt-1 text-4xl font-bold tracking-[-0.04em]">{group.assigned.label}</p>
        </div>
        <Button variant="secondary" size="sm" onClick={onPick}>
          Cambiar
        </Button>
      </Card>
    );
  }
  return (
    <Card className="flex flex-col gap-3 border-accent/40">
      <div className="flex items-start justify-between gap-3">
        <div className="flex gap-3">
          <Sparkles className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden />
          <div>
            <p className="font-semibold tracking-tight">Elige tu {name}</p>
            <p className="mt-0.5 text-sm text-white/60">
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
