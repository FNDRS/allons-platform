import type { HTMLAttributes } from "react";

type Padding = "none" | "sm" | "md" | "lg";

const PAD: Record<Padding, string> = {
  none: "p-0",
  sm: "p-4",
  md: "p-5",
  lg: "p-6 sm:p-7",
};

/** Translucent surface with a hairline border. The default container. */
export function Card({
  className = "",
  padding = "md",
  interactive = false,
  ...rest
}: HTMLAttributes<HTMLDivElement> & { padding?: Padding; interactive?: boolean }) {
  return (
    <div
      {...rest}
      className={`surface ${PAD[padding]} ${
        interactive
          ? "transition duration-200 hover:border-border-strong hover:bg-surface-2"
          : ""
      } ${className}`}
    />
  );
}

/** Small uppercase caption used as a section label. */
export function SectionTitle({
  children,
  action,
  className = "",
}: {
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`mb-3 flex min-w-0 items-baseline justify-between gap-3 ${className}`}>
      <h2 className="min-w-0 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted sm:text-[12px] sm:tracking-[0.2em]">
        {children}
      </h2>
      {action}
    </div>
  );
}

/** Numbered step label for one-page flows: "01 Entradas". */
export function StepTitle({
  step,
  children,
  hint,
}: {
  step: number;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="mb-3 flex items-baseline gap-3">
      <span className="text-[12px] font-bold tabular-nums tracking-[0.2em] text-accent">
        {String(step).padStart(2, "0")}
      </span>
      <h2 className="text-[17px] font-bold tracking-tight">{children}</h2>
      {hint ? <span className="text-sm text-dim">{hint}</span> : null}
    </div>
  );
}
