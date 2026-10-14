"use client";

import { Stat } from "@/components/ui/Stat";
import { ErrorState, Skeleton } from "@/components/ui/States";
import { useClassFinance, useFinanceRange } from "@/hooks/useClassFinance";
import { formatCents, formatNumber } from "@/lib/format";
import { ClassFinanceBreakdown } from "./ClassFinanceBreakdown";
import { ClassFinanceNotice } from "./ClassFinanceNotice";
import { ClassRevenueChart } from "./ClassRevenueChart";
import { FinanceRangeFields } from "./FinanceRangeFields";

/** What classes brought in: sales, memberships and credits still to be used. */
export function ClassFinanceView() {
  const r = useFinanceRange();
  const f = useClassFinance(r.range, !r.error);
  const finance = f.finance;

  return (
    <div className="flex flex-col gap-6">
      <ClassFinanceNotice>
        Las ventas de clases no se suman al saldo por liquidar que ves en Eventos.
      </ClassFinanceNotice>
      <FinanceRangeFields
        from={r.range.from}
        to={r.range.to}
        error={r.error}
        onFromChange={r.setFrom}
        onToChange={r.setTo}
      />

      {f.isLoading ? (
        <Skeleton className="h-[420px] w-full rounded-[24px]" />
      ) : f.error ? (
        <ErrorState message={f.error} onRetry={f.refetch} />
      ) : finance ? (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Stat dense label="Ventas brutas" value={formatCents(finance.totals.amountCents)} hint={`${formatNumber(finance.totals.count)} ventas`} />
            <Stat dense label="Comisiones" value={formatCents(finance.totals.feesCents)} />
            <Stat dense label="Neto" value={formatCents(finance.totals.netCents)} />
            <Stat dense label="Reembolsos" value={formatNumber(finance.totals.refunds)} />
          </div>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Stat
              dense
              label="Membresías activas"
              value={formatNumber(finance.memberships.active)}
              hint={finance.memberships.pastDue > 0 ? `${finance.memberships.pastDue} con pago pendiente` : undefined}
            />
            <Stat dense label="Cobro mensual" value={formatCents(finance.memberships.monthlyRecurringCents)} hint="De las membresías activas" />
            <Stat dense label="Cuotas por cobrar" value={formatCents(finance.memberships.pendingInstallmentsCents)} />
            <Stat
              dense
              label="Clases por usar"
              value={formatNumber(finance.outstandingCredits.credits)}
              hint={`${formatNumber(finance.outstandingCredits.holders)} clientes`}
            />
          </div>
          <ClassRevenueChart byMonth={finance.byMonth} />
          <ClassFinanceBreakdown finance={finance} />
        </>
      ) : null}
    </div>
  );
}
