"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useProviderActivity } from "@/hooks/useProviderActivity";
import { formatHNL } from "@/lib/format";
import { SectionTitle } from "@/components/ui/Card";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/States";
import { earningsSeries } from "./earningsSeries";

function axisMoney(value: number) {
  if (value >= 1000) {
    const thousands = value / 1000;
    const digits = value % 1000 === 0 ? 0 : 1;
    return `L ${thousands.toFixed(digits)}k`;
  }
  return `L ${Math.round(value)}`;
}

function Tip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value?: number }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-[16px] border border-white/10 bg-[#141414] px-3 py-2">
      <p className="text-[12px] text-white/45">{label}</p>
      <p className="mt-0.5 text-[14px] font-semibold tabular-nums">
        {formatHNL(Number(payload[0]?.value ?? 0))}
      </p>
    </div>
  );
}

/** How the deposit built up, from the sales already on the activity feed. */
export function EarningsChart({ enabled }: { enabled: boolean }) {
  const activity = useProviderActivity(enabled, 120);
  const points = earningsSeries(activity.data ?? []);

  return (
    <section>
      <SectionTitle>Cómo se acumuló</SectionTitle>
      {activity.isLoading ? (
        <Skeleton className="h-[280px]" />
      ) : activity.error ? (
        <ErrorState
          message={(activity.error as Error).message}
          onRetry={() => void activity.refetch()}
        />
      ) : points.length === 0 ? (
        <EmptyState
          title="Aún no hay ventas"
          body="Cuando se cobre el primer ticket, la curva muestra cómo crece el dinero."
          className="py-10"
        />
      ) : (
        <div className="h-[280px] rounded-[24px] border border-white/[0.08] bg-white/[0.03] px-2 py-4 sm:px-3">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={points}
              margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="earningsFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f67010" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="#f67010" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={axisMoney}
                tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                width={56}
              />
              <Tooltip
                content={<Tip />}
                cursor={{ stroke: "rgba(255,255,255,0.2)" }}
              />
              <Area
                type="monotone"
                dataKey="total"
                stroke="#f67010"
                strokeWidth={2}
                fill="url(#earningsFill)"
                dot={{
                  r: 3,
                  fill: "#f67010",
                  stroke: "#141414",
                  strokeWidth: 2,
                }}
                activeDot={{
                  r: 5,
                  fill: "#f67010",
                  stroke: "#fff",
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}
