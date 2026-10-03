"use client";

import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";

/** The demo switch button, the same on the list and on a campaign. */
export function CampaignDemoButton({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <Button size="sm" variant={enabled ? "white" : "glass"} aria-pressed={enabled} onClick={onToggle}>
      <Sparkles className="size-4" aria-hidden />
      {enabled ? "Salir de la demo" : "Ver demo"}
    </Button>
  );
}

/** Says the page shows example data, with a way out. */
export function CampaignDemoBanner({ onExit }: { onExit: () => void }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-[18px] border border-accent/30 bg-accent/10 px-4 py-3 text-[13px] text-white/80">
      <span>
        <strong className="font-semibold text-white">Demo:</strong> datos de ejemplo de cómo se verá
        con comercios y asistentes. Nada de esto es real.
      </span>
      <button type="button" onClick={onExit} className="font-semibold text-white underline-offset-2 hover:underline">
        Salir
      </button>
    </div>
  );
}
