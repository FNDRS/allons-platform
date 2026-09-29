"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { downloadTransactionsStatement, type ProviderPaymentRow } from "@/lib/api/provider";
import { formatDateTime, formatHNL } from "@/lib/format";
import { Card, SectionTitle } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/States";
import { glassCtaClass } from "@/components/ui/cta";

interface StatementRow {
  code: string;
  date: string;
  createdAt: string;
  amount: number;
  commission: number;
  cost: number;
  net: number;
}

function toRows(rows: ProviderPaymentRow[]): StatementRow[] {
  return rows
    .filter((row) => row.status === "paid")
    .map((row) => {
      const amount = row.amountCents / 100;
      const commission = (row.allonsFeeCents ?? 0) / 100;
      const cost = (row.gatewayCostCents ?? 0) / 100;
      return {
        code: row.authCode || row.orderId.slice(0, 8),
        date: formatDateTime(row.createdAt) ?? row.createdAt,
        createdAt: row.createdAt,
        amount,
        commission,
        cost,
        net: amount - commission - cost,
      };
    })
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

function csvCell(value: string | number): string {
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

interface StatementTotals {
  amount: number;
  commission: number;
  cost: number;
  net: number;
}

function downloadCsv(fileName: string, rows: StatementRow[], totals: StatementTotals) {
  const header = ["Código", "Fecha de cobro", "Monto", "Comisión del servicio", "Costo", "Total a acreditar"];
  const lines = [
    header,
    ...rows.map((row) => [row.code, row.createdAt, row.amount.toFixed(2), row.commission.toFixed(2), row.cost.toFixed(2), row.net.toFixed(2)]),
    ["", "Total", totals.amount.toFixed(2), totals.commission.toFixed(2), totals.cost.toFixed(2), totals.net.toFixed(2)],
  ];
  const csv = lines.map((line) => line.map(csvCell).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * A per-event accounting statement: one line per paid transaction (what the
 * gateway's own reference was, what it charged, what Allons and the gateway
 * withheld, and what's left to credit), plus totals, exportable as CSV.
 *
 * This is not a bank settlement batch: the platform has no record of which
 * transactions a bank deposit actually bundled together, only the orders
 * themselves. It functions as a receipt an organizer can reconcile against
 * their own bank statement, not a copy of the gateway's closing report.
 */
export function TransactionsStatement({
  eventId,
  eventTitle,
  rows: paymentRows,
}: {
  eventId: string;
  eventTitle: string;
  rows: ProviderPaymentRow[];
}) {
  const rows = toRows(paymentRows);
  const totals = rows.reduce(
    (acc, row) => ({
      amount: acc.amount + row.amount,
      commission: acc.commission + row.commission,
      cost: acc.cost + row.cost,
      net: acc.net + row.net,
    }),
    { amount: 0, commission: 0, cost: 0, net: 0 },
  );
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const slug = eventTitle.toLowerCase().replace(/\s+/g, "-");

  async function downloadPdf() {
    setDownloadingPdf(true);
    setPdfError(null);
    try {
      await downloadTransactionsStatement(eventId, `${slug}-transacciones.pdf`);
    } catch (error) {
      setPdfError((error as Error).message || "No se pudo generar el PDF.");
    } finally {
      setDownloadingPdf(false);
    }
  }

  return (
    <section>
      <SectionTitle
        action={
          rows.length > 0 ? (
            <div className="flex flex-col items-end gap-1.5">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={downloadingPdf}
                  onClick={() => void downloadPdf()}
                  className={`inline-flex h-9 items-center gap-1.5 px-3 text-[13px] disabled:opacity-60 ${glassCtaClass}`}
                >
                  <Download className="size-3.5" strokeWidth={1.5} aria-hidden />
                  {downloadingPdf ? "Generando…" : "Exportar PDF"}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    downloadCsv(`${slug}-transacciones.csv`, rows, totals)
                  }
                  className={`inline-flex h-9 items-center gap-1.5 px-3 text-[13px] ${glassCtaClass}`}
                >
                  <Download className="size-3.5" strokeWidth={1.5} aria-hidden />
                  Exportar CSV
                </button>
              </div>
              {pdfError ? (
                <p className="text-[12px] text-red-400">{pdfError}</p>
              ) : null}
            </div>
          ) : null
        }
      >
        Comprobante de transacciones
      </SectionTitle>
      {rows.length === 0 ? (
        <EmptyState
          title="Sin transacciones pagadas"
          body="Cuando haya ventas cobradas aparecerán aquí, listas para exportar."
        />
      ) : (
        <Card padding="none" className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-[13px]">
            <thead>
              <tr className="border-b border-border text-left text-white/45">
                <th className="px-4 py-3 font-medium">Código</th>
                <th className="px-4 py-3 font-medium">Fecha de cobro</th>
                <th className="px-4 py-3 text-right font-medium">Monto</th>
                <th className="px-4 py-3 text-right font-medium">Comisión del servicio</th>
                <th className="px-4 py-3 text-right font-medium">Costo</th>
                <th className="px-4 py-3 text-right font-medium">Total a acreditar</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={`${row.code}-${index}`} className="border-b border-border/60 last:border-0">
                  <td className="px-4 py-2.5 font-medium text-white/70">{row.code}</td>
                  <td className="px-4 py-2.5 text-white/55">{row.date}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums">{formatHNL(row.amount)}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-white/55">{formatHNL(row.commission)}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-white/55">{formatHNL(row.cost)}</td>
                  <td className="px-4 py-2.5 text-right font-semibold tabular-nums">{formatHNL(row.net)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-border-strong font-bold">
                <td className="px-4 py-3" colSpan={2}>Total</td>
                <td className="px-4 py-3 text-right tabular-nums">{formatHNL(totals.amount)}</td>
                <td className="px-4 py-3 text-right tabular-nums">{formatHNL(totals.commission)}</td>
                <td className="px-4 py-3 text-right tabular-nums">{formatHNL(totals.cost)}</td>
                <td className="px-4 py-3 text-right tabular-nums">{formatHNL(totals.net)}</td>
              </tr>
            </tfoot>
          </table>
        </Card>
      )}
    </section>
  );
}
