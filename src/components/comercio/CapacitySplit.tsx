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
        <div className="rounded-[22px] bg-white/[0.04] px-4 py-3.5 ring-1 ring-inset ring-white/[0.08]">
          <p className="text-[15px] text-white/50">
            Estos eventos no tienen cupo definido.
          </p>
        </div>
      ) : (
        <div className="rounded-[22px] bg-white/[0.04] px-4 py-4 ring-1 ring-inset ring-white/[0.08]">
          <div className="flex items-end justify-between gap-3">
            <p className="text-[34px] font-bold leading-none tracking-[-0.04em] tabular-nums">
              {soldPct}%
            </p>
            <p className="pb-1 text-[13px] text-white/40">
              {formatNumber(sold)} de {formatNumber(capacity)}
            </p>
          </div>
          <div
            className="mt-4 flex h-[3px] w-full overflow-hidden rounded-full bg-white/[0.08]"
            role="img"
            aria-label={`${soldPct}% de los cupos ya se vendió`}
          >
            <div
              className="h-full bg-accent"
              style={{ width: `${soldPct}%` }}
            />
          </div>
          <div className="mt-4 grid grid-cols-2 border-t border-white/[0.06] pt-3">
            <div>
              <p className="text-[12px] font-medium text-white/40">Vendidos</p>
              <p className="mt-0.5 text-[17px] font-semibold tabular-nums">
                {formatNumber(sold)}
              </p>
            </div>
            <div className="border-l border-white/[0.08] pl-4">
              <p className="text-[12px] font-medium text-white/40">Libres</p>
              <p className="mt-0.5 text-[17px] font-semibold tabular-nums">
                {formatNumber(free)}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
