"use client";

import Link from "next/link";
import {
  Banknote,
  CalendarDays,
  ScanLine,
  Ticket,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useProviderAccess } from "@/hooks/useProviderAccess";
import { useProviderActivity } from "@/hooks/useProviderActivity";
import type { ProviderActivityRow } from "@/lib/api/provider";
import { formatDateTime } from "@/lib/format";
import { Card } from "@/components/ui/Card";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/States";
import { activityExtra, activityTypeLabel } from "./activityCopy";

const ICON: Record<string, LucideIcon> = {
  sale: Ticket,
  scan: ScanLine,
  payout: Banknote,
  event: CalendarDays,
  staff: Users,
};

/** Full activity list. Each row opens its own detail. */
export function ActivitiesView() {
  const { ready } = useProviderAccess();
  const activity = useProviderActivity(ready, 120);
  const rows = activity.data ?? [];

  if (activity.isLoading) {
    return (
      <Card className="flex flex-col gap-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-16 rounded-[12px]" />
        ))}
      </Card>
    );
  }
  if (activity.error) {
    return (
      <ErrorState
        message={(activity.error as Error).message}
        onRetry={() => void activity.refetch()}
      />
    );
  }
  if (rows.length === 0) {
    return (
      <EmptyState
        title="Nada todavía"
        body="Cuando alguien compre o escanee un ticket lo verás aquí."
      />
    );
  }

  return (
    <Card padding="none">
      <ul className="divide-y divide-white/[0.06]">
        {rows.map((row) => (
          <li key={row.id}>
            <ActivityRow row={row} />
          </li>
        ))}
      </ul>
    </Card>
  );
}

function ActivityRow({ row }: { row: ProviderActivityRow }) {
  const Icon = ICON[row.type] ?? CalendarDays;
  const extra = activityExtra(row);
  const when = formatDateTime(row.date);
  return (
    <Link
      href={`/comercio/actividades/${row.id}`}
      className="flex items-start gap-3.5 px-5 py-4 transition hover:bg-white/[0.03]"
    >
      <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-white/[0.05] text-white/50">
        <Icon className="size-3.5" strokeWidth={1.5} aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-white/35">
          {activityTypeLabel(row.type)}
        </span>
        <span className="mt-1 block text-[14px] leading-5 text-white/85">{row.message}</span>
        {extra && !extra.eventId ? (
          <span className="mt-1 block text-[13px] text-white/45">
            {extra.label}: {extra.value}
          </span>
        ) : null}
      </span>
      {when ? (
        <time dateTime={row.date} className="shrink-0 text-[12px] tabular-nums text-white/35">
          {when}
        </time>
      ) : null}
    </Link>
  );
}
