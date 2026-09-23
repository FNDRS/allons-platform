import { ArrowDownRight, ArrowUpRight } from "lucide-react";

/**
 * KPI tile: quiet label, big number, optional delta beside it. The delta is
 * only rendered when the caller can derive it from real data.
 */
export function Stat({
  label,
  value,
  delta,
  hint,
  dense = false,
  className = "",
}: {
  label: string;
  value: string;
  /** Percent change; sign decides the color. */
  delta?: number | null;
  hint?: string;
  /** Shorter tile, for a dashboard that has to fit one screen. */
  dense?: boolean;
  className?: string;
}) {
  const showDelta = typeof delta === "number" && Number.isFinite(delta);
  const positive = (delta ?? 0) >= 0;
  return (
    <div
      className={`flex min-w-0 flex-col border border-white/[0.08] bg-white/[0.03] ${
        dense
          ? "gap-1 rounded-[16px] px-3.5 py-3"
          : "gap-2 rounded-[24px] p-4 sm:p-5"
      } ${className}`}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted sm:text-[12px] sm:tracking-[0.18em]">
        {label}
      </p>
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <p
          className={`break-words font-bold leading-none tracking-[-0.03em] tabular-nums ${
            dense
              ? "text-[20px] sm:text-[22px]"
              : "text-[22px] sm:text-[30px] lg:text-[34px]"
          }`}
        >
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
      {hint ? (
        <p
          className={
            dense ? "text-[12px] text-white/45" : "text-[13px] text-white/45"
          }
        >
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function Progress({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div
      className="h-1 w-full overflow-hidden rounded-full bg-white/[0.08]"
      aria-hidden
    >
      <div
        className="h-full rounded-full bg-accent transition-[width]"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
