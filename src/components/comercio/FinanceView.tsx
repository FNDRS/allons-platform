"use client";

import { Info } from "lucide-react";
import { useProviderAccess } from "@/hooks/useProviderAccess";
import { formatHNL } from "@/lib/format";
import { SectionTitle } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/States";
import { KpiTile } from "./KpiTile";

/**
 * The comercio's money: available, pending, held, and the fee Allons
 * plus the pasarela take on each sale. Withdrawals live in the app.
 */
export function FinanceView() {
  const { dashboard, dashboardLoading } = useProviderAccess({
    withDashboard: true,
  });
  const available = dashboard?.availableBalance ?? 0;
  const commission = dashboard?.commission;

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

      <p className="flex items-start gap-2.5 text-[13px] leading-relaxed text-white/45">
        <Info className="mt-0.5 size-4 shrink-0" strokeWidth={1.5} aria-hidden />
        {commission
          ? `De cada venta se retiene ${commission.totalFee}%: ${commission.baseFee}% de Allons${
              commission.planName ? ` (plan ${commission.planName})` : ""
            } y ${commission.pasarelaFee}% de la pasarela. Los retiros se piden desde la app.`
          : "Los retiros se piden desde la app, a la cuenta bancaria registrada con Allons."}
      </p>
    </div>
  );
}
