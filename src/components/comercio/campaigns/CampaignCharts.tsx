"use client";

import { useEffect, useId, useState } from "react";
import type { CampaignReport } from "@/lib/api/campaigns";
import { formatRate } from "./campaignFormat";

/** Same warm gradient and glow as the dashboard's progress bars. */
const FILL = "linear-gradient(90deg, #ffc48a 0%, #ff8c32 46%, #f67010 100%)";
const GLOW = "0 0 10px rgba(246,112,16,0.45)";

/** Flips true one frame after mount, so widths and rings animate in. */
function useEntered() {
  const [entered, setEntered] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(id);
  }, []);
  return entered;
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex min-w-0 flex-col gap-4 rounded-[28px] border border-white/[0.08] bg-gradient-to-b from-white/[0.05] to-white/[0.02] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
      <h3 className="text-[13px] font-semibold uppercase tracking-[0.12em] text-white/45">{title}</h3>
      {children}
    </section>
  );
}

/** Activity-style ring: attended over registered, with the rate inside. */
function AttendanceRing({ attended, registered, rate }: { attended: number; registered: number; rate: number }) {
  const entered = useEntered();
  const gradientId = `ring-${useId().replace(/:/g, "")}`;
  const size = 200;
  const stroke = 18;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const pct = registered > 0 ? Math.min(1, attended / registered) : 0;
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[200px]">
      <svg viewBox={`0 0 ${size} ${size}`} className="size-full -rotate-90" role="img" aria-label={`Asistencia ${formatRate(rate)}: ${attended} de ${registered}`}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffc48a" />
            <stop offset="50%" stopColor="#ff8c32" />
            <stop offset="100%" stopColor="#f67010" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={entered ? circumference * (1 - pct) : circumference}
          style={{
            filter: "drop-shadow(0 0 8px rgba(246,112,16,0.55))",
            transition: "stroke-dashoffset 1.1s cubic-bezier(0.32,0.72,0,1)",
          }}
          className="motion-reduce:transition-none"
        />
      </svg>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <p className="text-[34px] font-bold leading-none tracking-[-0.04em] tabular-nums">{formatRate(rate)}</p>
        <p className="mt-1.5 text-[12px] font-medium uppercase tracking-[0.14em] text-white/40">asistencia</p>
        <p className="mt-1 text-[13px] tabular-nums text-white/60">
          {attended.toLocaleString("es-HN")} de {registered.toLocaleString("es-HN")}
        </p>
      </div>
    </div>
  );
}

type Row = { key: string; name: string; attended: number; registered: number; rate: number };

/**
 * Capsule bars: the track is everyone registered (longest row = full
 * width), the glowing fill is who came. Name and numbers sit above the bar,
 * so long names never wrap into the chart.
 */
function CapsuleBars({ rows, onOpen }: { rows: Row[]; onOpen: (key: string) => void }) {
  const entered = useEntered();
  const max = Math.max(...rows.map((r) => r.registered), 1);
  return (
    <ul className="-mx-2 flex flex-col">
      {rows.map((r) => {
        const track = (r.registered / max) * 100;
        const fill = r.registered > 0 ? (r.attended / r.registered) * 100 : 0;
        return (
          <li key={r.key}>
            <button
              type="button"
              onClick={() => onOpen(r.key)}
              className="group flex w-full flex-col gap-2 rounded-[16px] px-2 py-2.5 text-left transition hover:bg-white/[0.04]"
            >
              <span className="flex items-baseline justify-between gap-3">
                <span className="truncate text-[14px] font-semibold tracking-tight text-white/90">{r.name}</span>
                <span className="shrink-0 text-[13px] tabular-nums text-white/50">
                  <span className="font-semibold text-white/85">{r.attended}</span>/{r.registered}
                  <span className="ml-2 text-white/35">{formatRate(r.rate)}</span>
                </span>
              </span>
              <span className="relative block h-2.5 w-full" aria-hidden>
                <span
                  className="absolute inset-y-0 left-0 rounded-full bg-white/[0.07] transition-[width] duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none"
                  style={{ width: entered ? `${track}%` : "0%" }}
                >
                  <span
                    className="absolute inset-y-0 left-0 rounded-full transition-[width] delay-150 duration-1000 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none"
                    style={{
                      width: entered ? `${fill}%` : "0%",
                      minWidth: fill > 0 ? 10 : 0,
                      background: FILL,
                      boxShadow: GLOW,
                    }}
                  />
                </span>
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

/**
 * The report at a glance, in the style of iOS Health and Fitness: an
 * attendance ring, then capsule bars per comercio and per event. Each row
 * opens its detail; the lists below stay as the table view.
 */
export function CampaignCharts({
  report,
  onOpenComercio,
  onOpenEvent,
}: {
  report: CampaignReport;
  onOpenComercio: (providerId: string) => void;
  onOpenEvent: (eventId: string) => void;
}) {
  const t = report.totals;
  if (t.registered === 0) return null;

  const comercios: Row[] = report.byComercio.map((c) => ({
    key: c.providerId,
    name: c.name,
    attended: c.attended,
    registered: c.registered,
    rate: c.attendanceRate,
  }));
  const events: Row[] = [...report.byEvent]
    .sort((a, b) => b.registered - a.registered)
    .map((e) => ({ key: e.eventId, name: e.title, attended: e.attended, registered: e.registered, rate: e.attendanceRate }));

  return (
    <div className="flex flex-col gap-3">
      <div className="grid gap-3 lg:grid-cols-[300px_minmax(0,1fr)]">
        <Panel title="Asistencia total">
          <div className="flex flex-1 items-center justify-center py-2">
            <AttendanceRing attended={t.attended} registered={t.registered} rate={t.attendanceRate} />
          </div>
        </Panel>
        <Panel title="Por comercio">
          <CapsuleBars rows={comercios} onOpen={onOpenComercio} />
        </Panel>
      </div>
      {events.length > 1 ? (
        <Panel title="Por evento">
          <CapsuleBars rows={events} onOpen={onOpenEvent} />
        </Panel>
      ) : null}
      <p className="px-1 text-[12px] text-white/35">
        La barra completa son los registrados; el tramo encendido, los que asistieron.
      </p>
    </div>
  );
}
