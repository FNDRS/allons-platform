import { Loader2 } from "lucide-react";
import type { ClassPackage } from "@/lib/api/classPrograms";
import { classPackagePriceLabel, describeClassPackage } from "@/lib/classFormat";

/**
 * One package. A free one is claimable once per person: claimed with
 * sessions left it leads to booking, claimed and spent it stops responding.
 */
export function ClassPackageCard({
  item,
  hasSessions,
  busy,
  disabled,
  onChoose,
}: {
  item: ClassPackage;
  hasSessions: boolean;
  busy: boolean;
  disabled: boolean;
  onChoose: () => void;
}) {
  const free = Number(item.price) <= 0;
  const claimed = free && Boolean(item.claimed);
  const spent = claimed && !hasSessions;
  const blocked = disabled || busy || spent;

  return (
    <button
      type="button"
      onClick={onChoose}
      disabled={blocked}
      className="flex w-full min-w-0 items-center gap-4 rounded-[22px] border border-white/[0.08] bg-[#0c0c0e] px-5 py-4 text-left transition hover:border-white/20 hover:bg-white/[0.04] disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:border-white/[0.08] disabled:hover:bg-[#0c0c0e]"
    >
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[15px] font-semibold tracking-tight">{item.name}</span>
        <span className="mt-0.5 block text-[13px] text-white/50">{describeClassPackage(item)}</span>
        {claimed ? (
          <span className="mt-1 block text-[12px] text-white/40">
            {spent ? "Una clase gratis por persona" : "Ya lo tienes. Toca para agendar"}
          </span>
        ) : null}
      </span>
      <span className="shrink-0 text-[15px] font-bold tabular-nums tracking-tight">
        {busy ? (
          <Loader2 className="size-4 animate-spin text-accent" aria-label="Agregando" />
        ) : claimed ? (
          <span className="text-[13px] font-semibold text-white/55">Reclamado</span>
        ) : (
          classPackagePriceLabel(item.price)
        )}
      </span>
    </button>
  );
}
