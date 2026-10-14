import { Info } from "lucide-react";

/** States what these numbers are and are not. */
export function ClassFinanceNotice({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-start gap-3 rounded-[14px] border border-border bg-surface px-4 py-3 text-[13px] leading-relaxed text-white/60">
      <Info className="mt-0.5 size-4 shrink-0 text-dim" aria-hidden />
      <span>{children}</span>
    </p>
  );
}
