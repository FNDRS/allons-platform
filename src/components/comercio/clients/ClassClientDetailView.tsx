"use client";

import Link from "next/link";
import { ArrowLeft, Mail, Phone } from "lucide-react";
import { ProfileAvatar } from "@/components/app/ProfileAvatar";
import { Stat } from "@/components/ui/Stat";
import { ErrorState, Skeleton } from "@/components/ui/States";
import { useClassClient } from "@/hooks/useClassClients";
import { useConfirm } from "@/hooks/useConfirm";
import type { ClassMembership } from "@/lib/api/classClients";
import { formatCents, formatNumber, formatShortDate } from "@/lib/format";
import { ClientGuestPassesSection } from "./ClientGuestPassesSection";
import { ClientMembershipsSection } from "./ClientMembershipsSection";
import { ClientPassesSection } from "./ClientPassesSection";
import { ClientReservationsSection } from "./ClientReservationsSection";
import { clientBalanceLabel } from "./clientFormat";

/** One class client: contact, numbers, passes, memberships and bookings. */
export function ClassClientDetailView({ userId }: { userId: string }) {
  const c = useClassClient(userId);
  const { confirm, dialog } = useConfirm();

  if (c.isLoading) return <Skeleton className="h-[420px] w-full rounded-[28px]" />;
  if (!c.client) {
    return <ErrorState message={c.error ?? "No se pudo cargar este cliente."} onRetry={c.refetch} />;
  }
  const { client } = c;

  const cancel = async (membership: ClassMembership) => {
    const ok = await confirm(
      "Cancelar membresía",
      `Se detienen los cobros de ${membership.packageName} a ${client.name} y la membresía queda cancelada. No se puede deshacer.`,
      "Cancelar membresía",
    );
    if (ok) c.cancelMembership(membership.id);
  };

  return (
    <div className="flex flex-col gap-6">
      <Link href="/comercio/clientes" className="inline-flex items-center gap-1.5 self-start text-[13px] font-semibold text-muted hover:text-white">
        <ArrowLeft className="size-4" aria-hidden />
        Clientes
      </Link>
      <div className="flex items-center gap-4">
        <ProfileAvatar src={client.avatarUrl} name={client.name} sizeClass="size-14" radiusClass="rounded-full" />
        <div className="min-w-0">
          <h1 className="truncate text-[26px] font-bold leading-tight tracking-[-0.03em] sm:text-[32px]">{client.name}</h1>
          <p className="text-[14px] text-muted">{clientBalanceLabel(client)}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-x-6 gap-y-2 text-[14px] text-white/75">
        {client.email ? (
          <a href={`mailto:${client.email}`} className="inline-flex items-center gap-2 hover:text-white">
            <Mail className="size-4 text-dim" aria-hidden />
            {client.email}
          </a>
        ) : null}
        {client.phone ? (
          <a href={`tel:${client.phone}`} className="inline-flex items-center gap-2 hover:text-white">
            <Phone className="size-4 text-dim" aria-hidden />
            {client.phone}
          </a>
        ) : null}
        {!client.email && !client.phone ? <p className="text-white/45">Sin datos de contacto.</p> : null}
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat dense label="Clases asistidas" value={formatNumber(client.classesAttended)} />
        <Stat dense label="Próximas" value={formatNumber(client.upcoming)} />
        <Stat dense label="Última visita" value={formatShortDate(client.lastVisitAt) ?? "Nunca"} />
        <Stat dense label="Total gastado" value={formatCents(client.spentCents)} />
      </div>
      <ClientMembershipsSection
        memberships={client.memberships}
        cancellingId={c.cancellingId}
        onCancel={(membership) => void cancel(membership)}
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <ClientPassesSection passes={client.passes} />
        <ClientReservationsSection reservations={client.reservations} />
      </div>
      <ClientGuestPassesSection guestPasses={client.guestPasses} />
      {dialog}
    </div>
  );
}
