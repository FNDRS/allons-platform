"use client";

import { type CSSProperties, type ReactNode, useEffect, useId, useRef, useState } from "react";

const PAD = 10;
const STROKE = 1.35;

const TONE = {
  danger: {
    bloom: "#f87171",
    core: "#ffffff",
    rim: "rgba(248,113,113,0.38)",
  },
  accent: {
    bloom: "#f67010",
    core: "#ffffff",
    rim: "rgba(246,112,16,0.42)",
  },
} as const;

/**
 * Hairline rim with a short spark traveling the border, the same family as
 * the comercio mark on event detail in the app. Glow sits on the stroke,
 * not on the fill.
 */
export function EdgeLight({
  tone,
  radius,
  children,
  className = "",
}: {
  tone: "danger" | "accent";
  /** Omit for a pill (half the measured height). */
  radius?: number;
  children: ReactNode;
  className?: string;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });
  const uid = useId().replace(/:/g, "");
  const palette = TONE[tone];

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const measure = () => {
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      setBox((prev) => (prev.w === w && prev.h === h ? prev : { w, h }));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const { w, h } = box;
  const r = radius ?? h / 2;
  const d = roundedRectPath(w, h, r, PAD, STROKE / 2);
  const length = roundedRectPerimeter(
    Math.max(0, w - STROKE),
    Math.max(0, h - STROKE),
    r,
  );
  const spark = Math.min(0.14, 40 / Math.max(length, 1));
  const gap = Math.max(0.001, 1 - spark);
  const canvasW = w + PAD * 2;
  const canvasH = h + PAD * 2;
  const gradId = `edge-${uid}`;

  return (
    <div ref={wrap} className={`relative overflow-visible ${className}`}>
      {w > 0 && h > 0 ? (
        <svg
          aria-hidden
          className="pointer-events-none absolute overflow-visible"
          width={canvasW}
          height={canvasH}
          style={{ left: -PAD, top: -PAD }}
        >
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#ffffff" stopOpacity="0.92" />
              <stop offset="0.32" stopColor={palette.bloom} stopOpacity="0.95" />
              <stop offset="0.7" stopColor="#ffffff" stopOpacity="0.22" />
              <stop offset="1" stopColor="#ffffff" stopOpacity="0.65" />
            </linearGradient>
          </defs>
          <path
            d={d}
            fill="none"
            stroke={palette.bloom}
            strokeWidth={STROKE + 6}
            strokeOpacity={0.16}
          />
          <path d={d} fill="none" stroke={palette.rim} strokeWidth={STROKE} />
          <path d={d} fill="none" stroke={`url(#${gradId})`} strokeWidth={STROKE} />
          <path
            d={d}
            fill="none"
            className="edge-light-spark"
            pathLength={1}
            stroke={palette.bloom}
            strokeWidth={STROKE + 5}
            strokeLinecap="round"
            strokeOpacity={0.32}
            strokeDasharray={`${spark} ${gap}`}
          />
          <path
            d={d}
            fill="none"
            className="edge-light-spark"
            pathLength={1}
            stroke={palette.core}
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={`${spark * 0.5} ${1 - spark * 0.5}`}
            style={{ "--edge-delay": "-2.4s" } as CSSProperties}
          />
        </svg>
      ) : null}
      {children}
    </div>
  );
}

function roundedRectPath(
  width: number,
  height: number,
  radius: number,
  origin: number,
  inset: number,
) {
  const x = origin + inset;
  const y = origin + inset;
  const w = Math.max(0, width - inset * 2);
  const h = Math.max(0, height - inset * 2);
  const r = Math.min(radius, w / 2, h / 2);
  return [
    `M ${x + r} ${y}`,
    `H ${x + w - r}`,
    `A ${r} ${r} 0 0 1 ${x + w} ${y + r}`,
    `V ${y + h - r}`,
    `A ${r} ${r} 0 0 1 ${x + w - r} ${y + h}`,
    `H ${x + r}`,
    `A ${r} ${r} 0 0 1 ${x} ${y + h - r}`,
    `V ${y + r}`,
    `A ${r} ${r} 0 0 1 ${x + r} ${y}`,
    "Z",
  ].join(" ");
}

function roundedRectPerimeter(width: number, height: number, radius: number) {
  const r = Math.min(radius, width / 2, height / 2);
  return 2 * (width + height - 4 * r) + 2 * Math.PI * r;
}
