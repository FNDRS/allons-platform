import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { ProfileAvatar } from "@/components/app/ProfileAvatar";
import type { ClassClient } from "@/lib/api/classClients";
import { formatCents, formatNumber, formatShortDate } from "@/lib/format";
import { clientBalanceLabel } from "./clientFormat";

/** One client in the list, linking to their detail. */
export function ClassClientRow({ client }: { client: ClassClient }) {
  const lastVisit = formatShortDate(client.lastVisitAt);
  return (
    <Link
      href={`/comercio/clientes/${encodeURIComponent(client.userId)}`}
      className="flex items-center gap-3 px-5 py-4 transition hover:bg-surface-2"
    >
      <ProfileAvatar src={client.avatarUrl} name={client.name} sizeClass="size-10" radiusClass="rounded-full" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-semibold tracking-tight">{client.name}</p>
        <p className="truncate text-[13px] text-white/55">{clientBalanceLabel(client)}</p>
      </div>
      <dl className="hidden shrink-0 grid-cols-3 gap-6 text-right text-[13px] md:grid">
        <div>
          <dt className="text-white/40">Asistió</dt>
          <dd className="font-semibold tabular-nums">{formatNumber(client.classesAttended)}</dd>
        </div>
        <div>
          <dt className="text-white/40">Última visita</dt>
          <dd className="font-semibold tabular-nums">{lastVisit ?? "Nunca"}</dd>
        </div>
        <div>
          <dt className="text-white/40">Gastado</dt>
          <dd className="font-semibold tabular-nums">{formatCents(client.spentCents)}</dd>
        </div>
      </dl>
      <ChevronRight className="size-4 shrink-0 text-dim" aria-hidden />
    </Link>
  );
}
