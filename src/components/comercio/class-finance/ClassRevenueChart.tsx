"use client";

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { SectionTitle } from "@/components/ui/Card";
import type { ClassFinance } from "@/lib/api/classFinance";
import { formatCents } from "@/lib/format";

type Point = { month: string; label: string; amountCents: number; netCents: number };

function monthLabel(month: string): string {
  const [y, m] = month.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, 15))
    .toLocaleDateString("es-HN", { timeZone: "UTC", month: "short", year: "2-digit" })
    .replace(/\./g, "");
}

function Tip({ active, payload }: { active?: boolean; payload?: Array<{ payload?: Point }> }) {
  const row = payload?.[0]?.payload;
  if (!active || !row) return null;
  return (
    <div className="rounded-[16px] border border-white/10 bg-[#141414] px-3 py-2">
      <p className="text-[12px] text-white/45">{row.label}</p>
      <p className="mt-0.5 text-[14px] font-semibold tabular-nums">{formatCents(row.amountCents)}</p>
      <p className="text-[12px] text-white/45">{`Neto ${formatCents(row.netCents)}`}</p>
    </div>
  );
}

/** Class revenue month by month in the range. */
export function ClassRevenueChart({ byMonth }: { byMonth: ClassFinance["byMonth"] }) {
  const points: Point[] = byMonth.map((row) => ({ ...row, label: monthLabel(row.month) }));
  return (
    <section>
      <SectionTitle>Ventas por mes</SectionTitle>
      {points.length === 0 ? (
        <div className="flex h-[240px] items-center rounded-[24px] border border-white/[0.08] bg-white/[0.03] px-5">
          <p className="text-[15px] text-white/50">No hay ventas de clases en este periodo.</p>
        </div>
      ) : (
        <div className="h-[240px] rounded-[24px] border border-white/[0.08] bg-white/[0.03] p-4 sm:p-5">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={points} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "rgba(250,250,247,0.4)", fontSize: 11, fontFamily: "Urbanist, sans-serif" }}
                minTickGap={12}
              />
              <Tooltip content={<Tip />} cursor={{ fill: "rgba(255,255,255,0.05)" }} />
              <Bar dataKey="amountCents" fill="#f67010" radius={[4, 4, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}
