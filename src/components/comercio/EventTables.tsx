import type { ProviderPaymentRow, ProviderTicketType } from "@/lib/api/provider";
import { formatCents, formatHNL, formatNumber } from "@/lib/format";
import { SectionTitle } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/States";
import { Progress } from "@/components/ui/Stat";

export function TicketTypeTable({
  types,
  rows,
}: {
  types: ProviderTicketType[];
  /** When given, revenue is the actual amount charged per type, not `sold * price`. A promo/courtesy ticket charges L 0 even though it counts toward `sold`. */
  rows?: ProviderPaymentRow[];
}) {
  const revenueByType = new Map<string, number>();
  const courtesyByType = new Map<string, number>();
  if (rows) {
    for (const row of rows) {
      if (!row.entryTypeId || row.status !== "paid") continue;
      // Ticket money only: `amountCents` also carries any buyer-paid gateway
      // service charge (see OrderMoneySplit), which is a platform charge, not
      // revenue from the ticket itself — same definition the backend and the
      // "Ingresos" KPI already use, so this list can't disagree with them.
      const charged =
        (row.subtotalCents ?? row.amountCents) - (row.donationCents ?? 0);
      revenueByType.set(
        row.entryTypeId,
        (revenueByType.get(row.entryTypeId) ?? 0) + charged,
      );
      if (charged === 0) {
        courtesyByType.set(
          row.entryTypeId,
          (courtesyByType.get(row.entryTypeId) ?? 0) + row.quantity,
        );
      }
    }
  }

  return (
    <section>
      <SectionTitle>Por tipo de entrada</SectionTitle>
      {types.length === 0 ? (
        <EmptyState title="Sin tipos de entrada" />
      ) : (
        <div className="flex flex-col gap-3">
          {types.map((type) => {
            const revenueCents = rows
              ? revenueByType.get(type.id) ?? 0
              : type.sold * type.price * 100;
            const courtesyCount = courtesyByType.get(type.id) ?? 0;
            return (
              <article
                key={type.id}
                className="rounded-[24px] border border-white/[0.08] bg-white/[0.03] p-4 sm:p-5"
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
                      {formatCents(revenueCents)}
                    </p>
                    {courtesyCount > 0 ? (
                      <p className="mt-0.5 text-[12px] tabular-nums text-white/35">
                        {courtesyCount} de cortesía
                      </p>
                    ) : null}
                  </div>
                </div>
                {type.total > 0 ? (
                  <div className="mt-4">
                    <Progress value={type.sold} max={type.total} />
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
