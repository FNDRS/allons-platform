import type { ProviderEventListItem } from "@/lib/api/provider";
import { formatNumber } from "@/lib/format";
import { SectionTitle } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/States";

/** How much of the inventory is already paid for. */
export function CapacitySplit({
  events,
  loading,
}: {
  events: ProviderEventListItem[];
  loading: boolean;
}) {
  const capacity = events.reduce(
    (sum, event) => sum + (event.capacity > 0 ? event.capacity : 0),
    0,
  );
  const sold = events.reduce(
    (sum, event) => sum + (event.capacity > 0 ? event.ticketsSold : 0),
    0,
  );
  const free = Math.max(capacity - sold, 0);
  const soldPct = capacity > 0 ? Math.round((sold / capacity) * 100) : 0;

  return (
    <section>
      <SectionTitle>Cupos</SectionTitle>
      {loading ? (
        <Skeleton className="h-40" />
      ) : capacity === 0 ? (
        <div className="rounded-[24px] border border-white/[0.08] bg-white/[0.03] p-4 sm:p-5">
          <p className="text-[14px] text-white/50">
            Estos eventos no tienen cupo definido.
          </p>
        </div>
      ) : (
        <div className="rounded-[24px] border border-white/[0.08] bg-white/[0.03] p-4 sm:p-5">
          <p className="text-[28px] font-bold leading-none tracking-[-0.03em] tabular-nums sm:text-[32px]">
            {soldPct}%
          </p>
          <p className="mt-2 text-[13px] text-white/50">
            {formatNumber(sold)} vendidos de {formatNumber(capacity)}
          </p>
          <div
            className="mt-4 flex h-2 w-full overflow-hidden rounded-full bg-white/[0.08]"
            role="img"
            aria-label={`${soldPct}% de los cupos ya se vendió`}
          >
            <div
              className="h-full bg-accent"
              style={{ width: `${soldPct}%` }}
            />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/40">
                Vendidos
              </p>
              <p className="mt-1 text-[18px] font-semibold tabular-nums">
                {formatNumber(sold)}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/40">
                Libres
              </p>
              <p className="mt-1 text-[18px] font-semibold tabular-nums">
                {formatNumber(free)}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
