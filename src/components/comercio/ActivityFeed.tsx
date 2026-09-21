"use client";

import {
  Banknote,
  CalendarDays,
  QrCode,
  Ticket,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { ProviderActivityRow } from "@/lib/api/provider";
import { formatRelativeTime } from "@/lib/format";
import { Card, SectionTitle } from "@/components/ui/Card";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/States";
import { LiveIndicator } from "./ProviderLive";

const ICON: Record<string, { Icon: LucideIcon; tint: string }> = {
  sale: { Icon: Ticket, tint: "text-accent" },
  scan: { Icon: QrCode, tint: "text-success" },
  payout: { Icon: Banknote, tint: "text-success" },
  event: { Icon: CalendarDays, tint: "text-white/70" },
  staff: { Icon: Users, tint: "text-white/70" },
};

/**
 * What just happened in the comercio, newest first. Sales land here the
 * moment the API writes them, so this is the panel's live ticker.
 */
export function ActivityFeed({
  rows,
  loading,
  error,
  onRetry,
}: {
  rows: ProviderActivityRow[];
  loading: boolean;
  error: Error | null;
  onRetry: () => void;
}) {
  return (
    <section>
      <SectionTitle action={<LiveIndicator />}>Actividad</SectionTitle>
      {loading ? (
        <Card className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-10 rounded-[12px]" />
          ))}
        </Card>
      ) : error ? (
        <ErrorState message={error.message} onRetry={onRetry} />
      ) : rows.length === 0 ? (
        <EmptyState
          title="Nada todavía"
          body="Cuando alguien compre o escanee un ticket lo verás aquí al instante."
        />
      ) : (
        <Card padding="none">
          <ul className="divide-y divide-white/[0.06]">
            {rows.map((row) => {
              const { Icon, tint } = ICON[row.type] ?? {
                Icon: CalendarDays,
                tint: "text-white/70",
              };
              return (
                <li key={row.id} className="flex items-center gap-3.5 px-5 py-3.5">
                  <span
                    className={`grid size-9 shrink-0 place-items-center rounded-[12px] bg-white/[0.05] ring-1 ring-white/[0.08] ${tint}`}
                  >
                    <Icon className="size-4" aria-hidden />
                  </span>
                  <p className="min-w-0 flex-1 truncate text-[14px] text-white/85">
                    {row.message}
                  </p>
                  <time
                    dateTime={row.date}
                    className="shrink-0 text-[12px] tabular-nums text-white/35"
                  >
                    {formatRelativeTime(row.date)}
                  </time>
                </li>
              );
            })}
          </ul>
        </Card>
      )}
    </section>
  );
}
