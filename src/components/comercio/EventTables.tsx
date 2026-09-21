import { Ticket, Users } from "lucide-react";
import type { ProviderPaymentRow, ProviderTicketType } from "@/lib/api/provider";
import { formatCents, formatDateTime, formatHNL, formatNumber } from "@/lib/format";
import { SectionTitle } from "@/components/ui/Card";
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

const PAYMENT_LABEL: Record<string, string> = {
  paid: "Pagado",
  pending_payment: "Pendiente",
  failed: "Falló",
  cancelled: "Cancelado",
  refunded: "Reembolsado",
};

export function PaymentsTable({
  rows,
  types,
}: {
  rows: ProviderPaymentRow[];
  types: ProviderTicketType[];
}) {
  const typeName = new Map(types.map((type) => [type.id, type.name]));

  return (
    <section>
      <SectionTitle
        action={
          rows.length > 0 ? (
            <span className="text-[12px] font-semibold text-white/40">
              {rows.length}
            </span>
          ) : null
        }
      >
        Pedidos
      </SectionTitle>
      {rows.length === 0 ? (
        <EmptyState
          title="Todavía no hay pedidos"
          body="Las compras con tarjeta aparecen aquí."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {rows.map((row) => {
            const names = (row.holders ?? [])
              .map((holder) => holder.name.trim())
              .filter(Boolean);
            const kind = row.entryTypeId
              ? typeName.get(row.entryTypeId)
              : undefined;
            const donation = row.donationCents ?? 0;
            return (
              <article
                key={row.orderId}
                className="rounded-[24px] border border-white/[0.08] bg-white/[0.03] p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[13px] text-white/45">
                      {formatDateTime(row.createdAt) ?? "—"}
                    </p>
                    <p className="mt-1.5 text-[22px] font-bold leading-none tracking-[-0.03em] tabular-nums sm:text-[26px]">
                      {formatCents(row.amountCents)}
                    </p>
                  </div>
                  <p className="shrink-0 text-[13px] text-white/40">
                    {PAYMENT_LABEL[row.status] ?? row.status}
                  </p>
                </div>

                <div className="mt-4 flex flex-col gap-1.5 text-[13px] text-white/50">
                  <p className="inline-flex items-center gap-1.5">
                    <Ticket className="size-3.5 shrink-0 text-white/35" strokeWidth={1.5} aria-hidden />
                    {row.quantity} {row.quantity === 1 ? "ticket" : "tickets"}
                    {kind ? ` · ${kind}` : ""}
                  </p>
                  {names.length > 0 ? (
                    <p className="inline-flex items-start gap-1.5">
                      <Users className="mt-0.5 size-3.5 shrink-0 text-white/35" strokeWidth={1.5} aria-hidden />
                      <span className="min-w-0">{names.join(", ")}</span>
                    </p>
                  ) : null}
                  {donation > 0 ? (
                    <p className="tabular-nums">
                      Incluye aporte {formatCents(donation)}
                    </p>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
