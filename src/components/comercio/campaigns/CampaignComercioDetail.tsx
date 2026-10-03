"use client";

import { ChevronRight } from "lucide-react";
import type { CampaignReport } from "@/lib/api/campaigns";
import { Stat } from "@/components/ui/Stat";
import { formatRate } from "./campaignFormat";

type ComercioRow = CampaignReport["byComercio"][number];
type EventRow = CampaignReport["byEvent"][number];

/** A comercio's numbers and its events in the campaign; each event opens. */
export function CampaignComercioDetail({
  comercio,
  events,
  onOpenEvent,
}: {
  comercio: ComercioRow;
  events: EventRow[];
  onOpenEvent: (eventId: string) => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-3 gap-2">
        <Stat label="Registrados" value={comercio.registered} />
        <Stat label="Asistieron" value={comercio.attended} />
        <Stat label="Tasa" value={formatRate(comercio.attendanceRate)} />
      </div>
      <ul className="flex flex-col divide-y divide-border overflow-hidden rounded-[18px] border border-border">
        {events.map((e) => (
          <li key={e.eventId}>
            <button
              type="button"
              onClick={() => onOpenEvent(e.eventId)}
              className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-surface-2"
            >
              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold">{e.title}</span>
                <span className="block text-[12px] text-dim">
                  {e.attended}/{e.registered} · {formatRate(e.attendanceRate)}
                  {e.removedAt ? " · Retirado" : ""}
                </span>
              </span>
              <ChevronRight className="size-4 shrink-0 text-white/30" aria-hidden />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
