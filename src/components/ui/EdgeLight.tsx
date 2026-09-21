"use client";

import { type CSSProperties, type ReactNode, useEffect, useId, useRef, useState } from "react";

const PAD = 14;
const STROKE = 1.15;

const TONE = {
  danger: {
    bloom: "#f87171",
    core: "#fff5f5",
    rim: "rgba(248,113,113,0.22)",
  },
  accent: {
    bloom: "#f67010",
    core: "#fff7f0",
    rim: "rgba(246,112,16,0.22)",
  },
} as const;

/**
 * Hairline rim with two short sparks opposite each other, same family as
 * the comercio mark on event detail. Glow sits on the stroke, not the fill.
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
  const spark = Math.min(0.04, 26 / Math.max(length, 1));
  const bloom = spark * 1.35;
  const canvasW = w + PAD * 2;
  const canvasH = h + PAD * 2;
  const blurId = `edge-blur-${uid}`;

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
            <filter
              id={blurId}
              x="-40%"
              y="-40%"
              width="180%"
              height="180%"
            >
              <feGaussianBlur stdDeviation="2.4" />
            </filter>
          </defs>
          <path
            d={d}
            fill="none"
            stroke={palette.rim}
            strokeWidth={STROKE}
          />
          <Spark d={d} palette={palette} spark={spark} bloom={bloom} blurId={blurId} />
          <Spark
            d={d}
            palette={palette}
            spark={spark}
            bloom={bloom}
            blurId={blurId}
            delay="-3s"
          />
        </svg>
      ) : null}
      {children}
    </div>
  );
}

function Spark({
  d,
  palette,
  spark,
  bloom,
  blurId,
  delay = "0s",
}: {
  d: string;
  palette: (typeof TONE)[keyof typeof TONE];
  spark: number;
  bloom: number;
  blurId: string;
  delay?: string;
}) {
  const style = { "--edge-delay": delay } as CSSProperties;
  return (
    <>
      <path
        d={d}
        fill="none"
        className="edge-light-spark"
        pathLength={1}
        filter={`url(#${blurId})`}
        stroke={palette.bloom}
        strokeWidth={STROKE + 7}
        strokeLinecap="round"
        strokeOpacity={0.5}
        strokeDasharray={`${bloom} ${1 - bloom}`}
        style={style}
      />
      <path
        d={d}
        fill="none"
        className="edge-light-spark"
        pathLength={1}
        stroke={palette.bloom}
        strokeWidth={STROKE + 1.4}
        strokeLinecap="round"
        strokeOpacity={0.9}
        strokeDasharray={`${spark} ${1 - spark}`}
        style={style}
      />
      <path
        d={d}
        fill="none"
        className="edge-light-spark"
        pathLength={1}
        stroke={palette.core}
        strokeWidth={STROKE}
        strokeLinecap="round"
        strokeDasharray={`${spark * 0.42} ${1 - spark * 0.42}`}
        style={style}
      />
    </>
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
