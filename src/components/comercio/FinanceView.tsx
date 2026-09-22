"use client";

import { useProviderAccess } from "@/hooks/useProviderAccess";
import { formatHNL } from "@/lib/format";
import { SectionTitle } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/States";
import { KpiTile } from "./KpiTile";

/** The comercio's money: available, pending, and held. */
export function FinanceView() {
  const { dashboard, dashboardLoading } = useProviderAccess({
    withDashboard: true,
  });
  const available = dashboard?.availableBalance ?? 0;

  return (
    <div className="flex flex-col gap-8">
      <section>
        <SectionTitle>Saldo</SectionTitle>
        {dashboardLoading ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-28" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <KpiTile label="Disponible" value={formatHNL(available)} hint="Listo para retirar" />
            <KpiTile
              label="Pendiente"
              value={formatHNL(dashboard?.pendingBalance ?? 0)}
              hint="Retiros en proceso"
            />
            <KpiTile
              label="Retenido"
              value={formatHNL(dashboard?.heldBalance ?? 0)}
              hint="Ventana de reembolso"
            />
          </div>
        )}
      </section>
    </div>
  );
}
