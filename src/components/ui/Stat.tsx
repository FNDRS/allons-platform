import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Card } from "./Card";

/**
 * KPI tile: quiet label, big number, optional delta beside it. The delta is
 * only rendered when the caller can derive it from real data.
 */
export function Stat({
  label,
  value,
  delta,
  hint,
  className = "",
}: {
  label: string;
  value: string;
  /** Percent change; sign decides the color. */
  delta?: number | null;
  hint?: string;
  className?: string;
}) {
  const showDelta = typeof delta === "number" && Number.isFinite(delta);
  const positive = (delta ?? 0) >= 0;
  return (
    <Card className={`flex flex-col gap-2 ${className}`}>
      <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-muted">
        {label}
      </p>
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <p className="text-[30px] font-bold leading-none tracking-[-0.03em] tabular-nums sm:text-[34px]">
          {value}
        </p>
        {showDelta ? (
          <span
            className={`inline-flex items-center gap-0.5 text-[13px] font-semibold tabular-nums ${
              positive ? "text-success" : "text-danger"
            }`}
          >
            {positive ? (
              <ArrowUpRight className="size-3.5" aria-hidden />
            ) : (
              <ArrowDownRight className="size-3.5" aria-hidden />
            )}
            {positive ? "+" : ""}
            {delta!.toFixed(1)}%
          </span>
        ) : null}
      </div>
      {hint ? <p className="text-[13px] text-dim">{hint}</p> : null}
    </Card>
  );
}

export function Progress({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className="h-1 w-full overflow-hidden rounded-full bg-white/[0.08]" aria-hidden>
      <div className="h-full rounded-full bg-accent transition-[width]" style={{ width: `${pct}%` }} />
    </div>
  );
}
