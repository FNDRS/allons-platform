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
import type { ProviderActivityRow } from "@/lib/api/provider";
import { formatRelativeTime } from "@/lib/format";
import { Card, SectionTitle } from "@/components/ui/Card";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/States";

const ICON: Record<string, LucideIcon> = {
  sale: Ticket,
  scan: ScanLine,
  payout: Banknote,
  event: CalendarDays,
  staff: Users,
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
      <SectionTitle
        action={
          <Link href="/comercio/actividades" className="text-[12px] font-semibold text-white/45 transition hover:text-white">
            Ver todas
          </Link>
        }
      >
        Actividad
      </SectionTitle>
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
              const Icon = ICON[row.type] ?? CalendarDays;
              return (
                <li key={row.id}>
                  <Link href={`/comercio/actividades/${row.id}`} className="flex items-center gap-3.5 px-5 py-3.5 transition hover:bg-white/[0.03]">
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-white/[0.05] text-white/50">
                    <Icon className="size-3.5" strokeWidth={1.5} aria-hidden />
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
                  </Link>
                </li>
              );
            })}
          </ul>
        </Card>
      )}
    </section>
  );
}
