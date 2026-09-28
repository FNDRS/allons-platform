"use client";

import { Bar, BarChart, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatNumber } from "@/lib/format";
import { SectionTitle } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/States";

export interface TicketMixRow {
  id: string;
  title: string;
  paid: number;
  courtesy: number;
}

function shortTitle(title: string) {
  const clean = title.replace(/\s+/g, " ").trim();
  if (clean.length <= 18) return clean;
  return `${clean.slice(0, 17).trimEnd()}...`;
}

function Tip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload?: { title?: string; paid?: number; courtesy?: number } }>;
}) {
  const row = payload?.[0]?.payload;
  if (!active || !row) return null;
  return (
    <div className="rounded-[16px] border border-white/10 bg-[#141414] px-3 py-2">
      <p className="max-w-[220px] text-[12px] text-white/45">{row.title}</p>
      <p className="mt-1 text-[13px] font-semibold tabular-nums text-accent">
        {formatNumber(row.paid ?? 0)} pagados
      </p>
      <p className="text-[13px] font-semibold tabular-nums text-[#3b82f6]">
        {formatNumber(row.courtesy ?? 0)} de cortesía
      </p>
    </div>
  );
}

/** How many tickets per event were actually paid vs. given away (100%-off codes). */
export function TicketMixChart({
  events,
  loading,
}: {
  events: TicketMixRow[];
  loading: boolean;
}) {
  const rows = [...events]
    .map((event) => ({
      id: event.id,
      title: event.title,
      short: shortTitle(event.title),
      paid: event.paid,
      courtesy: event.courtesy,
      total: event.paid + event.courtesy,
    }))
    .sort((a, b) => b.total - a.total || a.title.localeCompare(b.title, "es"))
    .slice(0, 6);
  const peak = rows.reduce((max, row) => Math.max(max, row.total), 0);
  const hasCourtesy = rows.some((row) => row.courtesy > 0);

  return (
    <section>
      <SectionTitle>Boletos: pagados vs. cortesía</SectionTitle>
      {loading ? (
        <Skeleton className="h-[280px]" />
      ) : rows.length === 0 ? (
        <div className="flex h-[280px] items-center rounded-[24px] border border-white/[0.08] bg-white/[0.03] px-5">
          <p className="text-[15px] text-white/50">Todavía no hay boletos vendidos.</p>
        </div>
      ) : (
        <div className="rounded-[24px] border border-white/[0.08] bg-white/[0.03] px-2 py-3 sm:px-3">
          <div className="mb-1 flex justify-end gap-4 px-3 text-[12px] text-white/50">
            <p className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-accent" aria-hidden />
              Pagados
            </p>
            <p className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-[#3b82f6]" aria-hidden />
              Cortesía
            </p>
          </div>
          <div style={{ height: Math.max(220, rows.length * 64) }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={rows}
                margin={{ top: 8, right: hasCourtesy ? 56 : 72, left: 4, bottom: 8 }}
                barCategoryGap={22}
              >
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
                <Tooltip content={<Tip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                <Bar
                  dataKey="paid"
                  stackId="tickets"
                  fill="#f67010"
                  radius={[10, 0, 0, 10]}
                  barSize={12}
                  background={{ fill: "rgba(255,255,255,0.07)", radius: 10 }}
                />
                <Bar dataKey="courtesy" stackId="tickets" fill="#3b82f6" radius={[0, 10, 10, 0]} barSize={12}>
                  <LabelList
                    dataKey="total"
                    position="right"
                    offset={12}
                    formatter={(value: unknown) => formatNumber(Number(value ?? 0))}
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
