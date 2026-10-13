import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { ClassPassBalance } from "@/lib/api/classPrograms";
import { describeClassBalance } from "@/lib/classFormat";
import { formatShortDate } from "@/lib/format";

/** A usable pass: how many sessions are left, and a way to book one. */
export function ClassPassCard({ pass }: { pass: ClassPassBalance }) {
  const expires = formatShortDate(pass.expiresAt);
  return (
    <Link
      href={`/clases/${encodeURIComponent(pass.programId)}#agenda`}
      className="flex min-w-0 items-center gap-4 rounded-[22px] border border-white/[0.08] bg-[#0c0c0e] px-5 py-4 transition hover:border-white/20 hover:bg-white/[0.04]"
    >
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[15px] font-semibold tracking-tight">
          {pass.programTitle}
        </span>
        <span className="block text-[13px] text-white/55">{describeClassBalance(pass)}</span>
        {expires ? (
          <span className="block text-[12px] text-white/40">Vencen el {expires}</span>
        ) : null}
      </span>
      <span className="flex shrink-0 items-center gap-1 text-[13px] font-semibold text-white/70">
        Agendar
        <ChevronRight className="size-4" aria-hidden />
      </span>
    </Link>
  );
}
