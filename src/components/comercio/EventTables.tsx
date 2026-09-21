import type { ProviderPaymentRow, ProviderTicketType } from "@/lib/api/provider";
import { formatCents, formatDateTime, formatHNL, formatNumber } from "@/lib/format";
import { SectionTitle } from "@/components/ui/Card";
import { StatusPill } from "@/components/ui/Pill";
import { EmptyState } from "@/components/ui/States";

export function TicketTypeTable({ types }: { types: ProviderTicketType[] }) {
  return (
    <section>
      <SectionTitle>Por tipo de entrada</SectionTitle>
      {types.length === 0 ? (
        <EmptyState title="Sin tipos de entrada" />
      ) : (
        <div className="flex flex-col gap-3">
          {types.map((type) => {
            const fill =
              type.total > 0
                ? Math.min(100, Math.round((type.sold / type.total) * 100))
                : 0;
            return (
              <article
                key={type.id}
                className="rounded-[24px] border border-white/[0.08] bg-white/[0.03] p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[16px] font-semibold tracking-tight">
                      {type.name}
                    </p>
                    <p className="mt-0.5 text-[13px] text-white/50">
                      {type.price > 0 ? formatHNL(type.price) : "Gratis"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[15px] font-semibold tabular-nums">
                      {formatNumber(type.sold)}
                      {type.total > 0 ? (
                        <span className="text-white/40">
                          {" "}
                          / {formatNumber(type.total)}
                        </span>
                      ) : null}
                    </p>
                    <p className="mt-0.5 text-[13px] tabular-nums text-white/50">
                      {formatHNL(type.sold * type.price)}
                    </p>
                  </div>
                </div>
                {type.total > 0 ? (
                  <div
                    className="mt-4 h-px w-full overflow-hidden rounded-full bg-white/[0.08]"
                    aria-hidden
                  >
                    <div className="h-full bg-white/40" style={{ width: `${fill}%` }} />
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

const PAYMENT_TONE: Record<string, "solid" | "glass" | "mute"> = {
  paid: "solid",
  pending_payment: "glass",
  failed: "mute",
  cancelled: "mute",
  refunded: "mute",
};
const PAYMENT_LABEL: Record<string, string> = {
  paid: "Pagado",
  pending_payment: "Pendiente",
  failed: "Falló",
  cancelled: "Cancelado",
  refunded: "Reembolsado",
};

export function PaymentsTable({ rows }: { rows: ProviderPaymentRow[] }) {
  return (
    <section>
      <SectionTitle>Pedidos</SectionTitle>
      {rows.length === 0 ? (
        <EmptyState
          title="Todavía no hay pedidos"
          body="Las compras con tarjeta aparecen aquí."
        />
      ) : (
        <div className="flex flex-col overflow-hidden rounded-[24px] border border-white/[0.08] bg-white/[0.03]">
          {rows.map((row, index) => (
            <article
              key={row.orderId}
              className={`flex flex-wrap items-center justify-between gap-3 px-5 py-4 ${
                index > 0 ? "border-t border-white/[0.06]" : ""
              }`}
            >
              <div className="min-w-0">
                <p className="text-[14px] font-medium text-white/85">
                  {formatDateTime(row.createdAt) ?? "—"}
                </p>
                <p className="mt-0.5 text-[13px] text-white/45">
                  {row.quantity} {row.quantity === 1 ? "ticket" : "tickets"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <p className="text-[14px] font-semibold tabular-nums tracking-tight">
                  {formatCents(row.amountCents)}
                </p>
                <StatusPill tone={PAYMENT_TONE[row.status] ?? "mute"}>
                  {PAYMENT_LABEL[row.status] ?? row.status}
                </StatusPill>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
