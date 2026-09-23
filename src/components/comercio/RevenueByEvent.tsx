import Link from "next/link";
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
        <div className="flex flex-col gap-3 rounded-[24px] border border-white/[0.08] bg-white/[0.03] p-4 sm:p-5">
          {rows.map((event) => {
            const share =
              total > 0 ? Math.round((event.revenue / total) * 100) : 0;
            const width = Math.max(4, Math.round((event.revenue / max) * 100));
            return (
              <Link
                key={event.id}
                href={`/comercio/events/${encodeURIComponent(event.id)}`}
                className="group block"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <p className="min-w-0 truncate text-[14px] font-semibold tracking-tight group-hover:text-white">
                    {event.title}
                  </p>
                  <p className="shrink-0 text-[14px] font-semibold tabular-nums">
                    {formatHNL(event.revenue)}
                  </p>
                </div>
                <p className="mt-0.5 text-[12px] text-white/45">
                  {formatNumber(event.ticketsSold)}{" "}
                  {event.ticketsSold === 1 ? "ticket" : "tickets"} · {share}%
                  del total
                </p>
                <div
                  className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.08]"
                  aria-hidden
                >
                  <div
                    className="h-full rounded-full bg-accent"
                    style={{ width: `${width}%` }}
                  />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
