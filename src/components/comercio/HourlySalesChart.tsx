"use client";

import { useState } from "react";
import type { HourlySales } from "@/lib/api/provider";
import { Card, SectionTitle } from "@/components/ui/Card";

const W = 640;
const H = 180;
const PAD = { top: 12, right: 8, bottom: 26, left: 28 };

/**
 * Tickets sold per hour today, one series. Single hue (the accent) on the
 * dark surface; values live in the tooltip and axis, never on every bar.
 */
export function HourlySalesChart({ data }: { data: HourlySales }) {
  const [hover, setHover] = useState<number | null>(null);
  const hours = data.hours.length === 24 ? data.hours : Array.from({ length: 24 }, (_, i) => data.hours[i] ?? 0);
  const max = Math.max(1, ...hours);
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;
  const slot = plotW / 24;
  const barW = Math.max(4, slot - 4);
  const ticks = [...new Set([0, Math.ceil(max / 2), max])];

  return (
    <section>
      <SectionTitle>Ventas por hora · hoy</SectionTitle>
      <Card>
        <p className="text-sm text-white/55">
          <span className="text-xl font-bold text-white">{data.total}</span> tickets hoy
        </p>
        <div className="relative mt-3">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            role="img"
            aria-label={`Ventas por hora, ${data.total} tickets hoy`}
            className="h-auto w-full"
            onMouseLeave={() => setHover(null)}
          >
            {ticks.map((tick) => {
              const y = PAD.top + plotH - (tick / max) * plotH;
              return (
                <g key={tick}>
                  <line x1={PAD.left} x2={W - PAD.right} y1={y} y2={y} stroke="rgba(255,255,255,0.08)" />
                  <text x={PAD.left - 6} y={y + 3.5} textAnchor="end" fontSize="10" fill="rgba(255,255,255,0.45)">
                    {tick}
                  </text>
                </g>
              );
            })}
            {hours.map((value, hour) => {
              const x = PAD.left + hour * slot + (slot - barW) / 2;
              const h = (value / max) * plotH;
              const y = PAD.top + plotH - h;
              const active = hover === hour;
              return (
                <g key={hour}>
                  <rect
                    x={PAD.left + hour * slot}
                    y={PAD.top}
                    width={slot}
                    height={plotH}
                    fill="transparent"
                    onMouseEnter={() => setHover(hour)}
                    onTouchStart={() => setHover(hour)}
                  />
                  {value > 0 ? (
                    <path
                      d={roundedTop(x, y, barW, h, 4)}
                      fill={active ? "#ffb27a" : "#f67010"}
                      pointerEvents="none"
                    />
                  ) : null}
                  {hour % 6 === 0 ? (
                    <text x={PAD.left + hour * slot + slot / 2} y={H - 8} textAnchor="middle" fontSize="10" fill="rgba(255,255,255,0.45)">
                      {String(hour).padStart(2, "0")}h
                    </text>
                  ) : null}
                </g>
              );
            })}
          </svg>
          {hover !== null ? (
            <div
              className="pointer-events-none absolute -top-2 rounded-xl border border-white/10 bg-[#161618] px-3 py-2 text-xs shadow-lg"
              style={{ left: `${((PAD.left + hover * slot + slot / 2) / W) * 100}%`, transform: "translateX(-50%)" }}
            >
              <p className="text-white/55">
                {String(hover).padStart(2, "0")}:00 – {String(hover + 1).padStart(2, "0")}:00
              </p>
              <p className="font-semibold">{hours[hover]} {hours[hover] === 1 ? "ticket" : "tickets"}</p>
            </div>
          ) : null}
        </div>
      </Card>
    </section>
  );
}

function roundedTop(x: number, y: number, w: number, h: number, r: number) {
  const radius = Math.min(r, w / 2, h);
  return `M${x},${y + h} V${y + radius} Q${x},${y} ${x + radius},${y} H${x + w - radius} Q${x + w},${y} ${x + w},${y + radius} V${y + h} Z`;
}
