"use client";

import {
  Bar,
  BarChart,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ProviderEventListItem } from "@/lib/api/provider";
import { formatHNL } from "@/lib/format";
import { SectionTitle } from "@/components/ui/Card";
import { ErrorState, Skeleton } from "@/components/ui/States";

function shortTitle(title: string) {
  const clean = title.replace(/\s+/g, " ").trim();
  if (clean.length <= 18) return clean;
  return `${clean.slice(0, 17).trimEnd()}...`;
}

function netOf(event: ProviderEventListItem) {
  return Math.max(0, event.revenue - (event.contributions ?? 0));
}

function Tip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload?: { title?: string; amount?: number } }>;
}) {
  const row = payload?.[0]?.payload;
  if (!active || !row) return null;
  return (
    <div className="rounded-[16px] border border-white/10 bg-[#141414] px-3 py-2">
      <p className="max-w-[220px] text-[12px] text-white/45">{row.title}</p>
      <p className="mt-0.5 text-[14px] font-semibold tabular-nums">
        {formatHNL(row.amount ?? 0)}
      </p>
    </div>
  );
}

/** Net taken in, one bar per event. The track stays visible when a bar is still at zero. */
export function EventRevenueChart({
  events,
  loading,
  error,
  onRetry,
}: {
  events: ProviderEventListItem[];
  loading: boolean;
  error?: string;
  onRetry?: () => void;
}) {
  const rows = [...events]
    .map((event) => {
      const amount = netOf(event);
      return {
        id: event.id,
        title: event.title,
        short: shortTitle(event.title),
        amount,
        display: formatHNL(amount),
      };
    })
    .sort((a, b) => b.amount - a.amount || a.title.localeCompare(b.title, "es"))
    .slice(0, 6);
  const peak = rows.reduce((max, row) => Math.max(max, row.amount), 0);

  return (
    <section>
      <SectionTitle>Por evento</SectionTitle>
      {loading ? (
        <Skeleton className="h-[280px]" />
      ) : error ? (
        <ErrorState message={error} onRetry={onRetry} />
      ) : rows.length === 0 ? (
        <div className="flex h-[280px] items-center rounded-[24px] border border-white/[0.08] bg-white/[0.03] px-5">
          <p className="text-[15px] text-white/50">Todavía no hay eventos.</p>
        </div>
      ) : (
        <div className="rounded-[24px] border border-white/[0.08] bg-white/[0.03] px-2 py-3 sm:px-3">
          <div style={{ height: Math.max(220, rows.length * 64) }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={rows}
                margin={{ top: 8, right: 112, left: 4, bottom: 8 }}
                barCategoryGap={22}
              >
                <defs>
                  <linearGradient id="eventRevenueBar" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#f67010" />
                    <stop offset="100%" stopColor="#ff9340" />
                  </linearGradient>
                </defs>
                <XAxis type="number" hide domain={[0, Math.max(peak, 1)]} />
                <YAxis
                  type="category"
                  dataKey="short"
                  width={128}
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: "rgba(250,250,247,0.88)",
                    fontSize: 13,
                    fontFamily: "Urbanist, sans-serif",
                  }}
                />
                <Tooltip
                  content={<Tip />}
                  cursor={{ fill: "rgba(255,255,255,0.03)" }}
                />
                <Bar
                  dataKey="amount"
                  fill="url(#eventRevenueBar)"
                  radius={[10, 10, 10, 10]}
                  barSize={12}
                  background={{ fill: "rgba(255,255,255,0.07)", radius: 10 }}
                >
                  <LabelList
                    dataKey="display"
                    position="right"
                    offset={12}
                    style={{
                      fill: "rgba(250,250,247,0.62)",
                      fontSize: 13,
                      fontWeight: 600,
                      fontFamily: "Urbanist, sans-serif",
                    }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </section>
  );
}
