"use client";

import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { CampaignReport } from "@/lib/api/campaigns";
import { formatRate } from "./campaignFormat";

/** Attended is the brand accent; no-show is the neutral remainder. */
const ATTENDED = "#f67010";
const NO_SHOW = "#71717a";
/** The chart surface, used as the 2px gap between touching marks. */
const SURFACE = "#141416";

type Row = { name: string; attended: number; noShow: number; rate: number };

function Legend() {
  return (
    <div className="flex items-center gap-4 text-[12px] text-white/60">
      <span className="inline-flex items-center gap-1.5">
        <span className="size-2.5 rounded-full" style={{ background: ATTENDED }} aria-hidden />
        Asistieron
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="size-2.5 rounded-full" style={{ background: NO_SHOW }} aria-hidden />
        No asistieron
      </span>
    </div>
  );
}

function RowTip({ active, payload }: { active?: boolean; payload?: Array<{ payload?: Row }> }) {
  const row = payload?.[0]?.payload;
  if (!active || !row) return null;
  return (
    <div className="rounded-[14px] border border-white/10 bg-[#141414] px-3 py-2 text-[12px]">
      <p className="font-semibold text-white">{row.name}</p>
      <p className="mt-0.5 text-white/70">
        {row.attended} asistieron · {row.noShow} no asistieron
      </p>
      <p className="text-white/45">{formatRate(row.rate)} de asistencia</p>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-3 rounded-[24px] border border-white/[0.08] bg-white/[0.03] p-4 sm:p-5">
      <p className="text-[13px] font-semibold text-white/80">{title}</p>
      {children}
    </div>
  );
}

/** Attended vs no-show, stacked, one bar per row; the tooltip names both. */
function StackedBars({ rows }: { rows: Row[] }) {
  const height = Math.max(120, rows.length * 34 + 16);
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} layout="vertical" margin={{ top: 4, right: 8, bottom: 4, left: 0 }} barCategoryGap={10}>
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="name"
            width={132}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 12 }}
          />
          <Tooltip cursor={{ fill: "rgba(255,255,255,0.04)" }} content={<RowTip />} />
          <Bar dataKey="attended" stackId="a" fill={ATTENDED} stroke={SURFACE} strokeWidth={2} radius={[4, 0, 0, 4]} barSize={14} />
          <Bar dataKey="noShow" stackId="a" fill={NO_SHOW} stroke={SURFACE} strokeWidth={2} radius={[0, 4, 4, 0]} barSize={14} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/**
 * The report at a glance: overall attendance as a ring, then attended vs
 * no-show per comercio and per event. The rows below stay as the table view.
 */
export function CampaignCharts({ report }: { report: CampaignReport }) {
  const t = report.totals;
  const noShow = Math.max(t.registered - t.attended, 0);
  const toRow = (r: { attended: number; registered: number; attendanceRate: number }, name: string): Row => ({
    name,
    attended: r.attended,
    noShow: Math.max(r.registered - r.attended, 0),
    rate: r.attendanceRate,
  });
  const comercios = report.byComercio.map((c) => toRow(c, c.name));
  const events = [...report.byEvent]
    .sort((a, b) => b.registered - a.registered)
    .slice(0, 10)
    .map((e) => toRow(e, e.title));

  if (t.registered === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      <Legend />
      <div className="grid gap-3 lg:grid-cols-[280px_minmax(0,1fr)]">
        <Panel title="Asistencia total">
          <div className="relative h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip
                  content={({ active, payload }) =>
                    active && payload?.[0] ? (
                      <div className="rounded-[14px] border border-white/10 bg-[#141414] px-3 py-2 text-[12px]">
                        <p className="font-semibold text-white">{String(payload[0].name)}</p>
                        <p className="text-white/70">{Number(payload[0].value).toLocaleString("es-HN")} personas</p>
                      </div>
                    ) : null
                  }
                />
                <Pie
                  data={[
                    { name: "Asistieron", value: t.attended },
                    { name: "No asistieron", value: noShow },
                  ]}
                  dataKey="value"
                  innerRadius="68%"
                  outerRadius="92%"
                  startAngle={90}
                  endAngle={-270}
                  stroke={SURFACE}
                  strokeWidth={2}
                  cornerRadius={4}
                  isAnimationActive={false}
                >
                  <Cell fill={ATTENDED} />
                  <Cell fill={NO_SHOW} />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-[26px] font-bold tabular-nums tracking-tight">{formatRate(t.attendanceRate)}</p>
              <p className="text-[12px] text-white/50">
                {t.attended.toLocaleString("es-HN")} de {t.registered.toLocaleString("es-HN")}
              </p>
            </div>
          </div>
        </Panel>
        <Panel title="Por comercio">
          <StackedBars rows={comercios} />
        </Panel>
      </div>
      {events.length > 1 ? (
        <Panel title={report.byEvent.length > 10 ? "Eventos con más registrados" : "Por evento"}>
          <StackedBars rows={events} />
        </Panel>
      ) : null}
    </div>
  );
}
