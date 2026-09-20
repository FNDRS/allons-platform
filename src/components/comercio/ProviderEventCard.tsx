import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { formatEventWhen } from "@/lib/allons-api";
import type { ProviderEventListItem } from "@/lib/api/provider";
import { formatHNL } from "@/lib/format";
import { Badge } from "@/components/ui/States";
import { Progress } from "./KpiTile";

const STATUS: Record<string, { label: string; tone: "neutral" | "accent" | "success" | "warn" }> = {
  published: { label: "Publicado", tone: "success" },
  draft: { label: "Borrador", tone: "neutral" },
  sold_out: { label: "Agotado", tone: "warn" },
  ended: { label: "Finalizado", tone: "neutral" },
};

export function ProviderEventCard({ event }: { event: ProviderEventListItem }) {
  const status = STATUS[event.status] ?? { label: event.status, tone: "neutral" as const };
  return (
    <Link
      href={`/comercio/events/${encodeURIComponent(event.id)}`}
      className="flex flex-col gap-3 rounded-[22px] border border-white/[0.08] bg-white/[0.03] p-4 transition hover:bg-white/[0.06]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-accent">
            {formatEventWhen(event.startsAt) ?? "Sin fecha"}
          </p>
          <p className="mt-0.5 truncate text-lg font-semibold tracking-tight">{event.title}</p>
        </div>
        <Badge tone={status.tone}>{status.label}</Badge>
      </div>
      <Progress value={event.ticketsSold} max={event.capacity} />
      <div className="flex items-center justify-between text-sm text-white/60">
        <span>
          <span className="font-semibold text-white">{event.ticketsSold}</span>
          {event.capacity > 0 ? ` / ${event.capacity}` : ""} vendidos
        </span>
        <span className="flex items-center gap-2">
          <span className="font-semibold text-white">{formatHNL(event.revenue)}</span>
          <ChevronRight className="size-4 text-white/30" aria-hidden />
        </span>
      </div>
    </Link>
  );
}
