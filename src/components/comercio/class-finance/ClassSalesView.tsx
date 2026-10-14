"use client";

import { FileDown } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/States";
import { useClassSales, useFinanceRange } from "@/hooks/useClassFinance";
import { ClassFinanceNotice } from "./ClassFinanceNotice";
import { ClassSalesTable } from "./ClassSalesTable";
import { FinanceRangeFields } from "./FinanceRangeFields";

/** Every class sale in a period, for the accountant. */
export function ClassSalesView() {
  const r = useFinanceRange();
  const s = useClassSales(r.range, !r.error);

  return (
    <div className="flex flex-col gap-6">
      <ClassFinanceNotice>
        Los comprobantes son documentos internos de venta, no facturas fiscales: no llevan CAI. Si tu cliente
        necesita factura, emítela en tu sistema de facturación.
      </ClassFinanceNotice>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <FinanceRangeFields
          from={r.range.from}
          to={r.range.to}
          error={r.error}
          onFromChange={r.setFrom}
          onToChange={r.setTo}
        />
        <Button
          variant="secondary"
          size="sm"
          loading={s.exporting}
          disabled={Boolean(r.error)}
          onClick={s.exportCsv}
        >
          {s.exporting ? null : <FileDown className="size-4" aria-hidden />}
          Exportar CSV
        </Button>
      </div>

      {s.isLoading ? (
        <Skeleton className="h-[360px] w-full rounded-[24px]" />
      ) : s.error ? (
        <ErrorState message={s.error} onRetry={s.refetch} />
      ) : !s.sales || s.sales.sales.length === 0 ? (
        <EmptyState title="Sin ventas en este periodo" body="Prueba con otras fechas." />
      ) : (
        <ClassSalesTable
          sales={s.sales.sales}
          totals={s.sales.totals}
          downloadingId={s.downloadingId}
          onReceipt={s.downloadReceipt}
        />
      )}
    </div>
  );
}
