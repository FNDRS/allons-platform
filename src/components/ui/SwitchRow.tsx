"use client";

/** A labeled on/off row, the app's switch in place of a native checkbox. */
export function SwitchRow({
  label,
  hint,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-4 rounded-[14px] border border-border bg-surface px-4 py-3 text-left transition hover:bg-surface-2 disabled:opacity-50"
    >
      <span className="min-w-0">
        <span className="block text-[14px] font-semibold tracking-tight">{label}</span>
        {hint ? <span className="block text-[12px] text-dim">{hint}</span> : null}
      </span>
      <span
        aria-hidden
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${checked ? "bg-accent" : "bg-white/15"}`}
      >
        <span
          className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-5" : "translate-x-0.5"}`}
        />
      </span>
    </button>
  );
}
