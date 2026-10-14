import { Button } from "@/components/ui/Button";
import { Card, SectionTitle } from "@/components/ui/Card";
import { StatusPill } from "@/components/ui/Pill";
import type { ClassMembership } from "@/lib/api/classClients";
import { formatCents, formatShortDate } from "@/lib/format";
import { MEMBERSHIP_STATUS_LABELS } from "./clientFormat";

function MembershipCard({
  membership,
  cancelling,
  onCancel,
}: {
  membership: ClassMembership;
  cancelling: boolean;
  onCancel: () => void;
}) {
  const nextCharge = formatShortDate(membership.nextChargeAt);
  const periodEnd = formatShortDate(membership.currentPeriodEnd);
  const cancellable = membership.status === "active" || membership.status === "past_due";
  const guests = membership.guestPasses;
  return (
    <Card className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <p className="min-w-0 flex-1 truncate text-[16px] font-bold tracking-tight">{membership.packageName}</p>
        <StatusPill tone={membership.live ? "solid" : "mute"}>{MEMBERSHIP_STATUS_LABELS[membership.status]}</StatusPill>
      </div>
      <dl className="grid grid-cols-2 gap-3 text-[13px]">
        <div>
          <dt className="text-white/40">Cuotas pagadas</dt>
          <dd className="font-semibold tabular-nums">
            {`${membership.installmentsPaid} de ${membership.installmentsTotal} · ${formatCents(membership.installmentCents)} c/u`}
          </dd>
        </div>
        <div>
          <dt className="text-white/40">Próximo cobro</dt>
          <dd className="font-semibold tabular-nums">{nextCharge ?? "Ninguno"}</dd>
        </div>
        <div>
          <dt className="text-white/40">Periodo actual hasta</dt>
          <dd className="font-semibold tabular-nums">{periodEnd ?? "Sin fecha"}</dd>
        </div>
        {guests.perMonth > 0 ? (
          <div>
            <dt className="text-white/40">Invitados este mes</dt>
            <dd className="font-semibold tabular-nums">{`${guests.usedThisMonth} de ${guests.perMonth}`}</dd>
          </div>
        ) : null}
      </dl>
      {membership.lastChargeError ? (
        <p className="text-[13px] text-red-300">{`Último cobro rechazado: ${membership.lastChargeError}`}</p>
      ) : null}
      {cancellable ? (
        <Button variant="danger" size="sm" className="self-start" loading={cancelling} onClick={onCancel}>
          Cancelar membresía
        </Button>
      ) : null}
    </Card>
  );
}

/** The client's memberships, with a way to stop future charges. */
export function ClientMembershipsSection({
  memberships,
  cancellingId,
  onCancel,
}: {
  memberships: ClassMembership[];
  cancellingId: string | null;
  onCancel: (membership: ClassMembership) => void;
}) {
  return (
    <section>
      <SectionTitle>{`Membresías · ${memberships.length}`}</SectionTitle>
      {memberships.length === 0 ? (
        <p className="text-[13px] text-white/50">No tiene membresías.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {memberships.map((membership) => (
            <MembershipCard
              key={membership.id}
              membership={membership}
              cancelling={cancellingId === membership.id}
              onCancel={() => onCancel(membership)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
