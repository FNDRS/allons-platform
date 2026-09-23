import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { ProviderEventListItem } from "@/lib/api/provider";
import { formatHNL, formatNumber } from "@/lib/format";
import { SectionTitle } from "@/components/ui/Card";
import { EmptyState, Skeleton } from "@/components/ui/States";

/** Where the deposit comes from: one bar per event that has sold. */
export function RevenueByEvent({
  events,
  loading,
}: {
  events: ProviderEventListItem[];
  loading: boolean;
}) {
  const rows = [...events]
    .filter((event) => event.revenue > 0)
    .sort((a, b) => b.revenue - a.revenue);
  const total = rows.reduce((sum, event) => sum + event.revenue, 0);
  const max = rows[0]?.revenue ?? 1;

  return (
    <section>
      <SectionTitle>Ingresos por evento</SectionTitle>
      {loading ? (
        <Skeleton className="h-40" />
      ) : rows.length === 0 ? (
        <EmptyState
          title="Aún no hay ventas"
          body="Cuando se cobre el primer ticket, aquí ves cuánto aporta cada evento."
          className="py-10"
        />
      ) : (
        <ul className="overflow-hidden rounded-[22px] bg-white/[0.04] ring-1 ring-inset ring-white/[0.08]">
          {rows.map((event) => {
            const share =
              total > 0 ? Math.round((event.revenue / total) * 100) : 0;
            const width = Math.max(8, Math.round((event.revenue / max) * 100));
            return (
              <li
                key={event.id}
                className="border-b border-white/[0.06] last:border-b-0"
              >
                <Link
                  href={`/comercio/events/${encodeURIComponent(event.id)}`}
                  className="block px-4 py-3.5 transition active:bg-white/[0.05]"
                >
                  <div className="flex items-center gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[16px] font-semibold tracking-tight">
                        {event.title}
                      </p>
                      <p className="mt-0.5 text-[13px] text-white/40">
                        {formatNumber(event.ticketsSold)}{" "}
                        {event.ticketsSold === 1 ? "ticket" : "tickets"} ·{" "}
                        {share}%
                      </p>
                    </div>
                    <p className="shrink-0 text-[16px] font-semibold tabular-nums tracking-tight">
                      {formatHNL(event.revenue)}
                    </p>
                    <ChevronRight
                      className="size-4 shrink-0 text-white/25"
                      strokeWidth={2}
                      aria-hidden
                    />
                  </div>
                  <div
                    className="mt-3 h-[3px] w-full overflow-hidden rounded-full bg-white/[0.08]"
                    aria-hidden
                  >
                    <div
                      className="h-full rounded-full bg-accent"
                      style={{ width: `${width}%` }}
                    />
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
