import { Download } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StatusPill } from "@/components/ui/Pill";
import type { ClassSale, ClassSalesTotals } from "@/lib/api/classFinance";
import { formatCents, formatDateTime, formatNumber } from "@/lib/format";

function itemLabel(sale: ClassSale): string {
  const { item } = sale;
  return [
    item.name,
    item.installment ? `cuota ${item.installment.number} de ${item.installment.total}` : null,
    item.programTitle,
  ]
    .filter(Boolean)
    .join(" · ");
}

/** The sales ledger: one row per sale, totals at the bottom. */
export function ClassSalesTable({
  sales,
  totals,
  downloadingId,
  onReceipt,
}: {
  sales: ClassSale[];
  totals: ClassSalesTotals;
  downloadingId: string | null;
  onReceipt: (sale: ClassSale) => void;
}) {
  return (
    <Card padding="none" className="overflow-x-auto">
      <table className="w-full min-w-[820px] text-left text-[13px]">
        <thead className="text-[11px] uppercase tracking-[0.14em] text-muted">
          <tr className="border-b border-border">
            <th className="px-5 py-3 font-semibold">Comprobante</th>
            <th className="px-3 py-3 font-semibold">Cliente</th>
            <th className="px-3 py-3 font-semibold">Concepto</th>
            <th className="px-3 py-3 text-right font-semibold">Monto</th>
            <th className="px-3 py-3 text-right font-semibold">Comisión</th>
            <th className="px-3 py-3 text-right font-semibold">Neto</th>
            <th className="px-5 py-3" aria-label="PDF" />
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {sales.map((sale) => (
            <tr key={sale.id} className={sale.status === "refunded" ? "text-white/45" : ""}>
              <td className="px-5 py-3">
                <p className="font-semibold tabular-nums">{sale.receiptNumber}</p>
                <p className="text-[12px] text-white/45">{formatDateTime(sale.createdAt)}</p>
              </td>
              <td className="px-3 py-3">{sale.customer.name}</td>
              <td className="px-3 py-3">
                <span>{itemLabel(sale)}</span>
                {sale.status === "refunded" ? (
                  <StatusPill tone="mute" className="ml-2">Reembolsada</StatusPill>
                ) : null}
              </td>
              <td className="px-3 py-3 text-right tabular-nums">{formatCents(sale.amountCents)}</td>
              <td className="px-3 py-3 text-right tabular-nums">{formatCents(sale.feesCents)}</td>
              <td className="px-3 py-3 text-right font-semibold tabular-nums">{formatCents(sale.netCents)}</td>
              <td className="px-5 py-3 text-right">
                <Button
                  variant="glass"
                  size="icon-sm"
                  aria-label={`Descargar comprobante ${sale.receiptNumber}`}
                  title="Descargar comprobante"
                  loading={downloadingId === sale.id}
                  onClick={() => onReceipt(sale)}
                >
                  {downloadingId === sale.id ? null : <Download className="size-4" aria-hidden />}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t border-border-strong font-bold">
            <td className="px-5 py-3" colSpan={3}>
              {`Total · ${formatNumber(totals.count)} ventas${totals.refunds > 0 ? `, ${totals.refunds} reembolsadas` : ""}`}
            </td>
            <td className="px-3 py-3 text-right tabular-nums">{formatCents(totals.amountCents)}</td>
            <td className="px-3 py-3 text-right tabular-nums">{formatCents(totals.feesCents)}</td>
            <td className="px-3 py-3 text-right tabular-nums">{formatCents(totals.netCents)}</td>
            <td />
          </tr>
        </tfoot>
      </table>
    </Card>
  );
}
