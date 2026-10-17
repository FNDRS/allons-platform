import { useState } from "react";
import { ChevronDown, ChevronUp, Ticket, Users } from "lucide-react";
import type {
  ProviderFreeReservation,
  ProviderPaymentRow,
  ProviderTicketType,
} from "@/lib/api/provider";
import { formatCents, formatDateTime, formatHNL, formatNumber } from "@/lib/format";
import { SectionTitle } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/States";
import { Progress } from "@/components/ui/Stat";
import { glassCtaClass } from "@/components/ui/cta";

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

const PAYMENT_LABEL: Record<string, string> = {
  paid: "Pagado",
  pending_payment: "Pendiente",
  failed: "Falló",
  cancelled: "Cancelado",
  refunded: "Reembolsado",
};

type OrderItem =
  | { kind: "order"; createdAt: string; row: ProviderPaymentRow }
  | { kind: "reservation"; createdAt: string; row: ProviderFreeReservation };

/** Orders and free reservations, newest first. */
function orderItems(
  rows: ProviderPaymentRow[],
  reservations: ProviderFreeReservation[],
): OrderItem[] {
  const items: OrderItem[] = [
    ...rows.map((row) => ({ kind: "order" as const, createdAt: row.createdAt, row })),
    ...reservations.map((row) => ({
      kind: "reservation" as const,
      createdAt: row.createdAt,
      row,
    })),
  ];
  return items.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

function OrderCard({
  createdAt,
  amount,
  status,
  quantity,
  kind,
  names,
  donationCents = 0,
}: {
  createdAt: string;
  amount: string;
  status: string;
  quantity: number;
  kind?: string;
  names: string[];
  donationCents?: number;
}) {
  return (
    <article className="rounded-[24px] border border-white/[0.08] bg-white/[0.03] p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[13px] text-white/45">{formatDateTime(createdAt) ?? "—"}</p>
          <p className="mt-1.5 text-[22px] font-bold leading-none tracking-[-0.03em] tabular-nums sm:text-[26px]">
            {amount}
          </p>
        </div>
        <p className="shrink-0 text-[13px] text-white/40">{status}</p>
      </div>

      <div className="mt-4 flex flex-col gap-1.5 text-[13px] text-white/50">
        <p className="inline-flex items-center gap-1.5">
          <Ticket className="size-3.5 shrink-0 text-white/35" strokeWidth={1.5} aria-hidden />
          {quantity} {quantity === 1 ? "ticket" : "tickets"}
          {kind ? ` · ${kind}` : ""}
        </p>
        {names.length > 0 ? (
          <p className="inline-flex items-start gap-1.5">
            <Users className="mt-0.5 size-3.5 shrink-0 text-white/35" strokeWidth={1.5} aria-hidden />
            <span className="min-w-0">{names.join(", ")}</span>
          </p>
        ) : null}
        {donationCents > 0 ? (
          <p className="tabular-nums">Incluye aporte {formatCents(donationCents)}</p>
        ) : null}
      </div>
    </article>
  );
}

export function PaymentsTable({
  rows,
  reservations = [],
  types,
}: {
  rows: ProviderPaymentRow[];
  /** Free reservations, which have no payment order. */
  reservations?: ProviderFreeReservation[];
  types: ProviderTicketType[];
}) {
  const [collapsed, setCollapsed] = useState(true);
  const typeById = new Map(types.map((type) => [type.id, type]));
  const items = orderItems(rows, reservations);

  return (
    <section>
      <div className="mb-3 flex min-w-0 items-baseline justify-between gap-3">
        <h2 className="min-w-0 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted sm:text-[12px] sm:tracking-[0.2em]">
          Pedidos
          {items.length > 0 ? (
            <span className="ml-1.5 text-white/40">{items.length}</span>
          ) : null}
        </h2>
        <button
          type="button"
          onClick={() => setCollapsed((current) => !current)}
          className={`inline-flex h-8 shrink-0 items-center gap-1.5 px-3 text-[12px] ${glassCtaClass}`}
        >
          {collapsed ? "Ver pedidos" : "Ocultar"}
          {collapsed ? (
            <ChevronDown className="size-3.5 text-white/45" strokeWidth={1.5} aria-hidden />
          ) : (
            <ChevronUp className="size-3.5 text-white/45" strokeWidth={1.5} aria-hidden />
          )}
        </button>
      </div>
      {collapsed ? null : items.length === 0 ? (
        <EmptyState
          title="Todavía no hay pedidos"
          body="Las compras y las reservas gratis aparecen aquí."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((item) => {
            if (item.kind === "reservation") {
              const row = item.row;
              const holderNames = row.holders.map((holder) => holder.name);
              return (
                <OrderCard
                  key={`reservation-${row.reservationId}`}
                  createdAt={row.createdAt}
                  amount="Gratis"
                  status="Reserva"
                  quantity={row.quantity}
                  kind={row.entryTypeId ? typeById.get(row.entryTypeId)?.name : undefined}
                  names={
                    holderNames.length > 0
                      ? holderNames
                      : row.buyerName
                        ? [row.buyerName]
                        : []
                  }
                />
              );
            }
            const row = item.row;
            const type = row.entryTypeId ? typeById.get(row.entryTypeId) : undefined;
            const isCourtesy = row.amountCents === 0 && (type?.price ?? 0) > 0;
            return (
              <OrderCard
                key={row.orderId}
                createdAt={row.createdAt}
                amount={formatCents(row.amountCents)}
                status={isCourtesy ? "Cortesía" : PAYMENT_LABEL[row.status] ?? row.status}
                quantity={row.quantity}
                kind={type?.name}
                names={(row.holders ?? [])
                  .map((holder) => holder.name.trim())
                  .filter(Boolean)}
                donationCents={row.donationCents ?? 0}
              />
            );
          })}
        </div>
      )}
    </section>
  );
}
