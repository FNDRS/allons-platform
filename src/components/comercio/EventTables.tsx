import type { ProviderPaymentRow, ProviderTicketType } from "@/lib/api/provider";
import { formatCents, formatDateTime, formatHNL } from "@/lib/format";
import { Card, SectionTitle } from "@/components/ui/Card";
import { Badge, EmptyState } from "@/components/ui/States";
import { Progress } from "./KpiTile";

export function TicketTypeTable({ types }: { types: ProviderTicketType[] }) {
  return (
    <section>
      <SectionTitle>Por tipo de entrada</SectionTitle>
      {types.length === 0 ? (
        <EmptyState title="Sin tipos de entrada" />
      ) : (
        <div className="flex flex-col gap-2.5">
          {types.map((type) => (
            <Card key={type.id} className="flex flex-col gap-2.5 py-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold tracking-tight">{type.name}</p>
                  <p className="text-sm text-white/50">{type.price > 0 ? formatHNL(type.price) : "Gratis"}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold tabular-nums">
                    {type.sold}
                    {type.total > 0 ? <span className="text-white/45"> / {type.total}</span> : null}
                  </p>
                  <p className="text-sm text-white/50">{formatHNL(type.sold * type.price)}</p>
                </div>
              </div>
              <Progress value={type.sold} max={type.total} />
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}

const STATUS_TONE: Record<string, "success" | "warn" | "danger" | "neutral"> = {
  paid: "success",
  pending_payment: "warn",
  failed: "danger",
  cancelled: "neutral",
  refunded: "neutral",
};
const STATUS_LABEL: Record<string, string> = {
  paid: "Pagado",
  pending_payment: "Pendiente",
  failed: "Falló",
  cancelled: "Cancelado",
  refunded: "Reembolsado",
};

export function PaymentsTable({ rows }: { rows: ProviderPaymentRow[] }) {
  return (
    <section>
      <SectionTitle>Pagos</SectionTitle>
      {rows.length === 0 ? (
        <EmptyState title="Todavía no hay pagos" body="Las compras con tarjeta aparecen aquí." />
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="w-full min-w-[520px] text-sm">
            <thead>
              <tr className="text-left text-[12px] uppercase tracking-[0.15em] text-white/45">
                <th className="px-4 py-3 font-semibold">Fecha</th>
                <th className="px-4 py-3 font-semibold">Estado</th>
                <th className="px-4 py-3 font-semibold text-right">Tickets</th>
                <th className="px-4 py-3 font-semibold text-right">Monto</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.orderId} className="border-t border-white/[0.06]">
                  <td className="px-4 py-3 text-white/75">{formatDateTime(row.createdAt) ?? "—"}</td>
                  <td className="px-4 py-3">
                    <Badge tone={STATUS_TONE[row.status] ?? "neutral"}>
                      {STATUS_LABEL[row.status] ?? row.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">{row.quantity}</td>
                  <td className="px-4 py-3 text-right font-semibold tabular-nums">{formatCents(row.amountCents)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </section>
  );
}
