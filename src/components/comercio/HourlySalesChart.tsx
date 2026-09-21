"use client";

import { useId, useState } from "react";
import type { HourlySales } from "@/lib/api/provider";
import { SectionTitle } from "@/components/ui/Card";

const W = 640;
const H = 200;
const PAD = { top: 16, right: 12, bottom: 28, left: 30 };

/**
 * Tickets sold per hour today as one area series: a 2px white line over a
 * quiet fill, a crosshair with a tooltip card on hover, and a grid.
 */
export function HourlySalesChart({ data }: { data: HourlySales }) {
  const gradientId = useId();
  const [hover, setHover] = useState<number | null>(null);
  const hours =
    data.hours.length === 24
      ? data.hours
      : Array.from({ length: 24 }, (_, i) => data.hours[i] ?? 0);
  const max = Math.max(1, ...hours);
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;
  const x = (hour: number) => PAD.left + (hour / 23) * plotW;
  const y = (value: number) => PAD.top + plotH - (value / max) * plotH;
  const ticks = [...new Set([0, Math.ceil(max / 2), max])];
  const peak = hours.reduce((best, value, hour) => (value > hours[best] ? hour : best), 0);

  const line = hours.map((value, hour) => `${hour === 0 ? "M" : "L"}${x(hour)},${y(value)}`).join(" ");
  const area = `${line} L${x(23)},${PAD.top + plotH} L${x(0)},${PAD.top + plotH} Z`;

  return (
    <section>
      <SectionTitle>Ventas por hora · hoy</SectionTitle>
      <div className="rounded-[24px] border border-white/[0.08] bg-white/[0.03] p-4 sm:p-5">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <p className="text-[30px] font-bold leading-none tracking-[-0.03em] tabular-nums sm:text-[34px]">
            {data.total}
          </p>
          <p className="text-sm text-muted">
            {data.total === 1 ? "ticket hoy" : "tickets hoy"}
            {data.total > 0 ? ` · pico a las ${String(peak).padStart(2, "0")}:00` : ""}
          </p>
        </div>
        <div className="relative mt-4">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            role="img"
            aria-label={`Ventas por hora, ${data.total} tickets hoy`}
            className="h-auto w-full touch-none"
            onMouseLeave={() => setHover(null)}
          >
            <defs>
              <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
              </linearGradient>
            </defs>
            {ticks.map((tick) => (
              <g key={tick}>
                <line
                  x1={PAD.left}
                  x2={W - PAD.right}
                  y1={y(tick)}
                  y2={y(tick)}
                  stroke="rgba(255,255,255,0.07)"
                />
                <text
                  x={PAD.left - 8}
                  y={y(tick) + 3.5}
                  textAnchor="end"
                  fontSize="10"
                  fill="rgba(255,255,255,0.4)"
                >
                  {tick}
                </text>
              </g>
            ))}
            <path d={area} fill={`url(#${gradientId})`} />
            <path d={line} fill="none" stroke="rgba(255,255,255,0.72)" strokeWidth="1.75" strokeLinejoin="round" strokeLinecap="round" />
            {hover !== null ? (
              <g pointerEvents="none">
                <line
                  x1={x(hover)}
                  x2={x(hover)}
                  y1={PAD.top}
                  y2={PAD.top + plotH}
                  stroke="rgba(255,255,255,0.22)"
                  strokeDasharray="2 3"
                />
                <circle cx={x(hover)} cy={y(hours[hover])} r="4" fill="#ffffff" stroke="#070708" strokeWidth="2" />
              </g>
            ) : null}
            {hours.map((_, hour) => (
              <rect
                key={hour}
                x={x(hour) - plotW / 46}
                y={PAD.top}
                width={plotW / 23}
                height={plotH}
                fill="transparent"
                onMouseEnter={() => setHover(hour)}
                onTouchStart={() => setHover(hour)}
              />
            ))}
            {[0, 6, 12, 18, 23].map((hour) => (
              <text
                key={hour}
                x={x(hour)}
                y={H - 8}
                textAnchor={hour === 0 ? "start" : hour === 23 ? "end" : "middle"}
                fontSize="10"
                fill="rgba(255,255,255,0.4)"
              >
                {String(hour).padStart(2, "0")}h
              </text>
            ))}
          </svg>
          {hover !== null ? (
            <div
              className="pointer-events-none absolute top-0 rounded-[16px] border border-white/[0.12] bg-[#111] px-3 py-2 text-xs"
              style={{
                left: `${(x(hover) / W) * 100}%`,
                transform: `translateX(${hover > 18 ? "-100%" : hover < 4 ? "0" : "-50%"})`,
              }}
            >
              <p className="text-white/45">
                {String(hover).padStart(2, "0")}:00 a {String(hover + 1).padStart(2, "0")}:00
              </p>
              <p className="mt-0.5 flex items-center gap-1.5 font-semibold text-white">
                <span className="size-1.5 rounded-full bg-white" aria-hidden />
                {hours[hover]} {hours[hover] === 1 ? "ticket" : "tickets"}
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
