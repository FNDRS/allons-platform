import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { StatusPill } from "@/components/ui/Pill";

/** A campaign line linking to its page, with a status pill and a subtitle. */
export function CampaignListCard({
  href,
  name,
  subtitle,
  pill,
}: {
  href: string;
  name: string;
  subtitle: string;
  pill?: string | null;
}) {
  return (
    <Link href={href} className="block">
      <Card interactive className="flex items-center gap-4">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[16px] font-semibold tracking-tight">{name}</p>
          <p className="mt-0.5 truncate text-[13px] text-white/50">{subtitle}</p>
        </div>
        {pill ? <StatusPill tone="mute">{pill}</StatusPill> : null}
        <ChevronRight className="size-4 shrink-0 text-white/30" aria-hidden />
      </Card>
    </Link>
  );
}
