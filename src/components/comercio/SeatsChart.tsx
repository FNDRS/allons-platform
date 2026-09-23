"use client";

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import type { ProviderEventListItem } from "@/lib/api/provider";
import { formatNumber } from "@/lib/format";
import { SectionTitle } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/States";

/** Sold seats against the ones still open. */
export function SeatsChart({
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
  const slices = [
    { name: "Vendidos", value: sold },
    { name: "Libres", value: free },
  ];

  return (
    <section>
      <SectionTitle>Cupos</SectionTitle>
      {loading ? (
        <Skeleton className="h-[280px]" />
      ) : capacity === 0 ? (
        <div className="flex h-[280px] items-center rounded-[24px] border border-white/[0.08] bg-white/[0.03] px-5">
          <p className="text-[15px] text-white/50">
            Estos eventos no tienen cupo definido.
          </p>
        </div>
      ) : (
        <div className="rounded-[24px] border border-white/[0.08] bg-white/[0.03] px-2 py-4">
          <div className="relative h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={slices}
                  dataKey="value"
                  nameKey="name"
                  innerRadius="68%"
                  outerRadius="88%"
                  startAngle={90}
                  endAngle={-270}
                  stroke="none"
                  paddingAngle={2}
                >
                  <Cell fill="#f67010" />
                  <Cell fill="rgba(255,255,255,0.08)" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-[28px] font-bold leading-none tracking-[-0.04em] tabular-nums">
                {soldPct}%
              </p>
              <p className="mt-1 text-[12px] text-white/40">vendido</p>
            </div>
          </div>
          <div className="mt-1 flex justify-center gap-6 text-[13px]">
            <p className="flex items-center gap-2 text-white/70">
              <span className="size-2 rounded-full bg-accent" aria-hidden />
              Vendidos {formatNumber(sold)}
            </p>
            <p className="flex items-center gap-2 text-white/70">
              <span className="size-2 rounded-full bg-white/20" aria-hidden />
              Libres {formatNumber(free)}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
