"use client";

import { useProviderAccess } from "@/hooks/useProviderAccess";
import { formatHNL } from "@/lib/format";
import { SectionTitle } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/States";
import { KpiTile } from "./KpiTile";

/** What the comercio is owed, and the two things the contract does not offer yet. */
export function FinanceBalances({
  available,
  loading = false,
}: {
  available: number;
  loading?: boolean;
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-28" />
        ))}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <KpiTile
        label="Por depositar"
        value={formatHNL(available)}
        hint="Después del evento"
      />
      <KpiTile label="Reembolsos" value="No hay" hint="No están en el contrato" />
      <KpiTile label="Retiros" value="Aún no" hint="El retiro no está activo" />
    </div>
  );
}

export function FinanceView() {
  const { dashboard, dashboardLoading } = useProviderAccess({
    withDashboard: true,
  });

  return (
    <div className="flex flex-col gap-8">
      <section>
        <SectionTitle>Depósito</SectionTitle>
        <FinanceBalances
          available={dashboard?.availableBalance ?? 0}
          loading={dashboardLoading}
        />
      </section>
    </div>
  );
}
