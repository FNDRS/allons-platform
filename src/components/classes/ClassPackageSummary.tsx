import type { ClassPackage } from "@/lib/api/classPrograms";
import { describeClassPackage } from "@/lib/classFormat";
import { formatHNL } from "@/lib/format";

/** The package being bought and its total. */
export function ClassPackageSummary({
  programTitle,
  item,
}: {
  programTitle: string;
  item: ClassPackage;
}) {
  return (
    <div className="rounded-[22px] border border-white/[0.08] bg-[#0c0c0e] px-5 py-4">
      <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-white/40">
        {programTitle}
      </p>
      <div className="mt-1.5 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="break-words text-[16px] font-semibold tracking-tight">{item.name}</p>
          <p className="mt-0.5 text-[13px] text-white/50">{describeClassPackage(item)}</p>
        </div>
        <p className="shrink-0 text-[16px] font-bold tabular-nums tracking-tight">
          {formatHNL(Number(item.price))}
        </p>
      </div>
      <p className="mt-3 border-t border-white/[0.06] pt-3 text-[13px] text-white/45">
        Después de pagar eliges el día y la hora de cada clase.
      </p>
    </div>
  );
}
