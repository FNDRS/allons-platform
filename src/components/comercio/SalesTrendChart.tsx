"use client";

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { formatHNL, formatNumber } from "@/lib/format";
import { SectionTitle } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/States";

export interface SalesTrendPoint {
  /** "2026-09-20", sortable. */
  day: string;
  /** "20 sept" for the axis. */
  label: string;
  cumulativeCents: number;
  dayQty: number;
}

function Tip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload?: SalesTrendPoint }>;
}) {
  const row = payload?.[0]?.payload;
  if (!active || !row) return null;
  return (
    <div className="rounded-[16px] border border-white/10 bg-[#141414] px-3 py-2">
      <p className="text-[12px] text-white/45">{row.label}</p>
      <p className="mt-0.5 text-[14px] font-semibold tabular-nums">
        {formatHNL(row.cumulativeCents / 100)}
      </p>
      <p className="text-[12px] text-white/45">
        +{formatNumber(row.dayQty)} {row.dayQty === 1 ? "boleto ese día" : "boletos ese día"}
      </p>
    </div>
  );
}

/** Running total of what's come in, day by day, across every event. */
export function SalesTrendChart({
  points,
  loading,
}: {
  points: SalesTrendPoint[];
  loading: boolean;
}) {
  const total = points.at(-1)?.cumulativeCents ?? 0;

  return (
    <section>
      <SectionTitle>Ventas acumuladas</SectionTitle>
      {loading ? (
        <Skeleton className="h-[280px]" />
      ) : points.length === 0 ? (
        <div className="flex h-[280px] items-center rounded-[24px] border border-white/[0.08] bg-white/[0.03] px-5">
          <p className="text-[15px] text-white/50">Todavía no hay ventas registradas.</p>
        </div>
      ) : (
        <div className="rounded-[24px] border border-white/[0.08] bg-white/[0.03] p-4 sm:p-5">
          <p className="text-[24px] font-bold leading-none tracking-[-0.03em] tabular-nums">
            {formatHNL(total / 100)}
          </p>
          <p className="mt-1 text-[13px] text-white/45">Acumulado a la fecha</p>
          <div className="mt-4 h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={points} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
                <defs>
                  <linearGradient id="salesTrendFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f67010" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#f67010" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: "rgba(250,250,247,0.4)",
                    fontSize: 11,
                    fontFamily: "Urbanist, sans-serif",
                  }}
                  minTickGap={24}
                />
                <Tooltip content={<Tip />} cursor={{ stroke: "rgba(255,255,255,0.15)" }} />
                <Area
                  type="monotone"
                  dataKey="cumulativeCents"
                  stroke="#f67010"
                  strokeWidth={2}
                  fill="url(#salesTrendFill)"
                  dot={false}
                  activeDot={{ r: 4, fill: "#f67010", stroke: "#070708", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </section>
  );
}
