"use client";

import type { CampaignAttendeeList, CampaignReport } from "@/lib/api/campaigns";
import { StatusPill } from "@/components/ui/Pill";
import { ErrorState, Skeleton } from "@/components/ui/States";
import { Stat } from "@/components/ui/Stat";
import { formatRate } from "./campaignFormat";

type EventRow = CampaignReport["byEvent"][number];

/**
 * One event of the campaign: its numbers and who registered. Names and
 * answers show only where the buyer consented; the rest read "Anónimo".
 */
export function CampaignEventDetail({
  event,
  list,
  loading,
  error,
  onRetry,
}: {
  event: EventRow;
  list?: CampaignAttendeeList;
  loading: boolean;
  error: Error | null;
  onRetry: () => void;
}) {
  const labels = new Map(list?.questions.map((q) => [q.id, q.label]) ?? []);
  return (
    <div className="flex flex-col gap-5">
      <p className="text-[13px] text-white/50">
        {event.providerName}
        {event.removedAt ? " · Retirado de la campaña" : ""}
      </p>
      <div className="grid grid-cols-3 gap-2">
        <Stat label="Registrados" value={event.registered} />
        <Stat label="Asistieron" value={event.attended} />
        <Stat label="Tasa" value={formatRate(event.attendanceRate)} />
      </div>

      {loading ? (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
        </div>
      ) : error && !list ? (
        <ErrorState message={error.message} onRetry={onRetry} />
      ) : !list || list.attendees.length === 0 ? (
        <p className="text-[13px] text-white/50">Todavía no hay personas registradas en este evento.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-border rounded-[18px] border border-border">
          {list.attendees.map((a, i) => {
            const answers = Object.entries(a.answers).filter(([, v]) => v?.trim());
            return (
              <li key={`${a.registeredAt}-${i}`} className="flex flex-col gap-1.5 px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <p className={`truncate font-semibold ${a.consented ? "" : "text-white/50"}`}>{a.name}</p>
                  <StatusPill tone={a.attended ? "gray" : "mute"}>
                    {a.attended ? "Asistió" : "No asistió"}
                  </StatusPill>
                </div>
                {answers.length > 0 ? (
                  <dl className="flex flex-col gap-0.5 text-[12px]">
                    {answers.map(([qid, value]) => (
                      <div key={qid} className="flex gap-1.5">
                        <dt className="shrink-0 text-dim">{labels.get(qid) ?? "Pregunta"}:</dt>
                        <dd className="min-w-0 truncate text-white/75">{value}</dd>
                      </div>
                    ))}
                  </dl>
                ) : !a.consented ? (
                  <p className="text-[12px] text-dim">No aceptó compartir sus datos.</p>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
