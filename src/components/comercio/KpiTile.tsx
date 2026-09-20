export function KpiTile({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-[20px] border border-white/[0.08] bg-white/[0.04] px-4 py-4">
      <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-white/45">{label}</p>
      <p className="mt-1.5 text-2xl font-bold tracking-[-0.03em] tabular-nums sm:text-3xl">{value}</p>
      {hint ? <p className="mt-0.5 text-xs text-white/45">{hint}</p> : null}
    </div>
  );
}

export function Progress({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.08]" aria-hidden>
      <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
    </div>
  );
}
