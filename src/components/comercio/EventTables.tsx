import type { ProviderPaymentRow, ProviderTicketType } from "@/lib/api/provider";
import { formatCents, formatHNL } from "@/lib/format";
import { Card, SectionTitle } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/States";

export function TicketTypeTable({
  types,
  rows,
}: {
  types: ProviderTicketType[];
  /** When given, revenue is the actual amount charged per type, not `sold * price`. A promo/courtesy ticket charges L 0 even though it counts toward `sold`. */
  rows?: ProviderPaymentRow[];
}) {
  const revenueByType = new Map<string, number>();
  if (rows) {
    for (const row of rows) {
      if (!row.entryTypeId || row.status !== "paid") continue;
      // Ticket money only: `amountCents` also carries any buyer-paid gateway
      // service charge (see OrderMoneySplit), which is a platform charge, not
      // revenue from the ticket itself, same definition the backend and the
      // "Ingresos" KPI already use, so this list can't disagree with them.
      const charged =
        (row.subtotalCents ?? row.amountCents) - (row.donationCents ?? 0);
      revenueByType.set(
        row.entryTypeId,
        (revenueByType.get(row.entryTypeId) ?? 0) + charged,
      );
    }
  }
  const paidTypes = types.filter((type) => type.price > 0);

  return (
    <section>
      <SectionTitle>Ingresos por tipo de entrada</SectionTitle>
      {paidTypes.length === 0 ? (
        <EmptyState title="Sin entradas pagadas" />
      ) : (
        <Card padding="none" className="divide-y divide-border">
          {paidTypes.map((type) => {
            const revenueCents = rows
              ? revenueByType.get(type.id) ?? 0
              : type.sold * type.price * 100;
            return (
              <div
                key={type.id}
                className="flex items-center justify-between gap-4 px-5 py-4 text-[14px]"
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold text-white/85">{type.name}</p>
                  <p className="mt-0.5 text-[12px] tabular-nums text-white/45">
                    Precio de lista {formatHNL(type.price)}
                  </p>
                </div>
                <p className="shrink-0 font-semibold tabular-nums">
                  {formatCents(revenueCents)}
                </p>
              </div>
            );
          })}
        </Card>
      )}
    </section>
  );
}
