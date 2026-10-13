import { Ticket } from "lucide-react";
import type { ClassPassBalance } from "@/lib/api/classPrograms";
import { describeClassBalance } from "@/lib/classFormat";
import { formatShortDate } from "@/lib/format";

/** What the buyer holds for this program. */
export function ClassBalanceCard({ balance }: { balance: ClassPassBalance }) {
  const expires = formatShortDate(balance.expiresAt);
  return (
    <div className="flex items-center gap-3.5 rounded-[22px] border border-accent/25 bg-accent/[0.07] px-5 py-4">
      <span className="grid size-10 shrink-0 place-items-center rounded-[13px] bg-white/[0.06] text-white/85 ring-1 ring-white/15">
        <Ticket className="size-[18px]" strokeWidth={1.6} aria-hidden />
      </span>
      <span className="min-w-0">
        <span className="block text-[15px] font-semibold tracking-tight">
          {describeClassBalance(balance)}
        </span>
        <span className="block text-[13px] text-white/55">
          {expires ? `Vencen el ${expires}` : "Sin fecha de vencimiento"}
        </span>
      </span>
    </div>
  );
}
