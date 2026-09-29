"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, CalendarDays, Download } from "lucide-react";
import { useProviderAccess } from "@/hooks/useProviderAccess";
import { useProviderLive } from "./ProviderLive";
import {
  downloadEventSettlement,
  getProviderEvent,
  getProviderPayments,
  providerKeys,
} from "@/lib/api/provider";
import { formatCardDay, formatHNL, formatNumber } from "@/lib/format";
import { ErrorState, Skeleton } from "@/components/ui/States";
import { glassCtaClass } from "@/components/ui/cta";
import { TicketTypeTable } from "./EventTables";
import { KpiTile } from "./KpiTile";
import { SalesTrendChart, type SalesTrendPoint } from "./SalesTrendChart";
import { TransactionsStatement } from "./TransactionsStatement";

const dayFmt = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Tegucigalpa",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});
const dayLabelFmt = new Intl.DateTimeFormat("es-HN", {
  timeZone: "America/Tegucigalpa",
  day: "numeric",
  month: "short",
});

/**
 * Money only: what this event generated and what's owed to the comercio.
 * Sales/attendee/day-of-event operations (seating, hourly activity, the
 * order list, sharing the event) live on its Eventos page instead, not
 * here, so this stays a page you'd actually hand to an accountant.
 */
export function ComercioEventView({ eventId }: { eventId: string }) {
  const { ready } = useProviderAccess();
  // Realtime already invalidates these keys; the interval is the fallback
  // for a browser that cannot hold the socket open.
  const { live } = useProviderLive();
  const event = useQuery({
    queryKey: providerKeys.event(eventId),
    queryFn: () => getProviderEvent(eventId),
    enabled: ready,
    refetchInterval: live ? false : 60_000,
  });
  const payments = useQuery({
    queryKey: providerKeys.payments(eventId),
    queryFn: () => getProviderPayments(eventId),
    enabled: ready,
    refetchInterval: live ? false : 60_000,
  });
  const [downloadingSettlement, setDownloadingSettlement] = useState(false);
  const [settlementError, setSettlementError] = useState<string | null>(null);

  async function downloadSettlement() {
    setDownloadingSettlement(true);
    setSettlementError(null);
    try {
      const title = event.data?.title ?? "evento";
      await downloadEventSettlement(
        eventId,
        `liquidacion-${title.toLowerCase().replace(/\s+/g, "-")}.pdf`,
      );
    } catch (error) {
      setSettlementError(
        (error as Error).message || "No se pudo generar el comprobante.",
      );
    } finally {
      setDownloadingSettlement(false);
    }
  }

  if (event.isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-28 rounded-[24px]" />
        <Skeleton className="h-64 rounded-[24px]" />
      </div>
    );
  }
  if (event.error || !event.data) {
    return (
      <ErrorState
        message={(event.error as Error | null)?.message}
        onRetry={() => void event.refetch()}
      />
    );
  }
  const data = event.data;
  const day = formatCardDay(data.startsAt);
  const paymentRows = payments.data?.data ?? [];
  const typeById = new Map((data.ticketTypes ?? []).map((type) => [type.id, type]));

  // A ticket type's list price times quantity versus what the order actually
  // charged (minus any donation, which is not a ticket discount). Any
  // positive gap is a code applied at checkout, partial or full.
  let discountedCount = 0;
  let discountedAmount = 0;
  const dayTotals = new Map<string, { cents: number; qty: number }>();
  for (const row of paymentRows) {
    if (row.status !== "paid") continue;
    const type = row.entryTypeId ? typeById.get(row.entryTypeId) : undefined;
    const listAmount = (type?.price ?? 0) * row.quantity;
    // Ticket money only, same as `Ingresos`: `amountCents` also carries any
    // buyer-paid gateway service charge, which isn't part of the ticket's
    // own price and must not read as a discount (or a sale) here.
    const ticketCents =
      (row.subtotalCents ?? row.amountCents) - (row.donationCents ?? 0);
    const chargedAmount = ticketCents / 100;
    if (listAmount - chargedAmount > 0) {
      discountedCount += row.quantity;
      discountedAmount += listAmount - chargedAmount;
    }
    const key = dayFmt.format(new Date(row.createdAt));
    const entry = dayTotals.get(key) ?? { cents: 0, qty: 0 };
    entry.cents += ticketCents;
    entry.qty += row.quantity;
    dayTotals.set(key, entry);
  }

  let running = 0;
  const salesTrend: SalesTrendPoint[] = [...dayTotals.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([day, entry]) => {
      running += entry.cents;
      return {
        day,
        label: dayLabelFmt.format(new Date(`${day}T12:00:00`)),
        cumulativeCents: running,
        dayQty: entry.qty,
      };
    });

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-5">
        <Link
          href="/comercio/finanzas"
          className="inline-flex w-fit items-center gap-1.5 text-[13px] font-semibold text-white/45 transition hover:text-white"
        >
          <ArrowLeft className="size-4" aria-hidden /> Finanzas
        </Link>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="break-words text-[24px] font-bold leading-[1.1] tracking-[-0.03em] sm:text-[32px]">
              {data.title}
            </h1>
            <p className="mt-3 flex items-center gap-1.5 text-[13px] text-white/50">
              <CalendarDays className="size-3.5 text-white/35" strokeWidth={1.5} aria-hidden />
              {day ?? "Sin fecha"}
            </p>
          </div>
          <div className="flex w-full shrink-0 flex-col items-end gap-1.5 sm:w-auto">
            <button
              type="button"
              disabled={downloadingSettlement}
              onClick={() => void downloadSettlement()}
              className={`inline-flex h-10 w-full shrink-0 items-center justify-center gap-1.5 px-4 text-[13px] disabled:opacity-60 sm:w-auto ${glassCtaClass}`}
            >
              {downloadingSettlement ? "Generando…" : "Comprobante de liquidación"}
              <Download className="size-3.5 text-white/45" strokeWidth={1.5} aria-hidden />
            </button>
            {settlementError ? (
              <p className="text-[12px] text-red-400">{settlementError}</p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <KpiTile
          label="Vendidos"
          value={
            data.capacity > 0
              ? `${formatNumber(data.ticketsSold)} / ${formatNumber(data.capacity)}`
              : formatNumber(data.ticketsSold)
          }
          hint={
            data.capacity > 0
              ? `${Math.round((data.ticketsSold / data.capacity) * 100)}% de la capacidad`
              : undefined
          }
        />
        <KpiTile
          label="Ingresos"
          value={formatHNL(data.revenue - (data.contributions ?? 0))}
        />
        {discountedCount > 0 ? (
          <KpiTile
            label="Con descuento"
            value={formatNumber(discountedCount)}
            hint={`${formatHNL(discountedAmount)} menos que el precio de lista`}
          />
        ) : null}
      </div>

      <TicketTypeTable types={data.ticketTypes ?? []} rows={paymentRows} />

      <SalesTrendChart points={salesTrend} loading={payments.isLoading} />

      {payments.isLoading ? (
        <Skeleton className="h-48 rounded-[24px]" />
      ) : payments.error ? (
        <ErrorState
          message={(payments.error as Error).message}
          onRetry={() => void payments.refetch()}
        />
      ) : (
        <TransactionsStatement eventTitle={data.title} rows={paymentRows} />
      )}
    </div>
  );
}
