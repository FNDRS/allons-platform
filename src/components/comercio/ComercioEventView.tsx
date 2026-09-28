"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowUpRight, Building2, CalendarDays, Clock, Download } from "lucide-react";
import { useProviderAccess } from "@/hooks/useProviderAccess";
import { useProviderLive } from "./ProviderLive";
import {
  downloadEventSettlement,
  getHourlySales,
  getProviderEvent,
  getProviderPayments,
  providerKeys,
} from "@/lib/api/provider";
import { formatCardDay, formatCardTime, formatHNL, formatNumber } from "@/lib/format";
import { ErrorState, Skeleton } from "@/components/ui/States";
import { glassCtaClass } from "@/components/ui/cta";
import { ShareEventButton } from "./ShareEventButton";
import { PaymentsTable, TicketTypeTable } from "./EventTables";
import { HourlySalesChart } from "./HourlySalesChart";
import { KpiTile } from "./KpiTile";
import { ResourceMap } from "./ResourceMap";
import { SalesTrendChart, type SalesTrendPoint } from "./SalesTrendChart";
import { TransactionsStatement } from "./TransactionsStatement";
import { useProviderResources } from "@/hooks/useProviderResources";

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

const STATUS: Record<string, string> = {
  published: "Publicado",
  draft: "Borrador",
  sold_out: "Agotado",
  ended: "Finalizado",
};

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
  const hourly = useQuery({
    queryKey: providerKeys.hourly(eventId),
    queryFn: () => getHourlySales(eventId),
    enabled: ready,
    refetchInterval: live ? false : 60_000,
  });
  const payments = useQuery({
    queryKey: providerKeys.payments(eventId),
    queryFn: () => getProviderPayments(eventId),
    enabled: ready,
    refetchInterval: live ? false : 60_000,
  });
  const seats = useProviderResources(eventId, ready);
  const [downloadingSettlement, setDownloadingSettlement] = useState(false);

  async function downloadSettlement() {
    setDownloadingSettlement(true);
    try {
      const title = event.data?.title ?? "evento";
      await downloadEventSettlement(
        eventId,
        `liquidacion-${title.toLowerCase().replace(/\s+/g, "-")}.pdf`,
      );
    } catch {
      // The download button has no inline error slot; a failed generation is
      // rare enough that asking the organizer to just try again is enough.
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
  const status = STATUS[data.status] ?? data.status;
  const day = formatCardDay(data.startsAt);
  const time = formatCardTime(data.startsAt);
  const place = [data.venue, data.city].filter(Boolean).join(", ");
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
    const chargedAmount = (row.amountCents - (row.donationCents ?? 0)) / 100;
    if (listAmount - chargedAmount > 0) {
      discountedCount += row.quantity;
      discountedAmount += listAmount - chargedAmount;
    }
    const key = dayFmt.format(new Date(row.createdAt));
    const entry = dayTotals.get(key) ?? { cents: 0, qty: 0 };
    entry.cents += row.amountCents;
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
            <p className="mt-2 text-[13px] text-white/40">{status}</p>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-white/50">
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="size-3.5 text-white/35" strokeWidth={1.5} aria-hidden />
                {day ?? "Sin fecha"}
              </span>
              {time ? (
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="size-3.5 text-white/35" strokeWidth={1.5} aria-hidden />
                  {time}
                </span>
              ) : null}
              {place ? (
                <span className="inline-flex items-center gap-1.5">
                  <Building2 className="size-3.5 text-white/35" strokeWidth={1.5} aria-hidden />
                  {place}
                </span>
              ) : null}
            </div>
          </div>
          <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:flex-row">
            <ShareEventButton eventId={eventId} title={data.title} />
            <button
              type="button"
              disabled={downloadingSettlement}
              onClick={() => void downloadSettlement()}
              className={`inline-flex h-10 w-full shrink-0 items-center justify-center gap-1.5 px-4 text-[13px] disabled:opacity-60 sm:w-auto ${glassCtaClass}`}
            >
              {downloadingSettlement ? "Generando…" : "Comprobante de liquidación"}
              <Download className="size-3.5 text-white/45" strokeWidth={1.5} aria-hidden />
            </button>
            <Link
              href={`/events/${encodeURIComponent(eventId)}`}
              className={`inline-flex h-10 w-full shrink-0 items-center justify-center gap-1.5 px-4 text-[13px] sm:w-auto ${glassCtaClass}`}
            >
              Ver página pública
              <ArrowUpRight className="size-3.5 text-white/45" strokeWidth={1.5} aria-hidden />
            </Link>
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
        <KpiTile
          label="Escaneados"
          value={formatNumber(data.scans)}
          hint={
            data.ticketsSold > 0
              ? `${Math.round((data.scans / data.ticketsSold) * 100)}% asistencia`
              : undefined
          }
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

      {seats.isLoading ? (
        <Skeleton className="h-64 rounded-[24px]" />
      ) : (
        <ResourceMap
          groups={seats.groups}
          typeNames={Object.fromEntries(
            (data.ticketTypes ?? []).map((type) => [type.id, type.name]),
          )}
          busy={seats.assign.isPending || seats.release.isPending}
          onRelease={(resourceId) => seats.release.mutate(resourceId)}
          onAssign={(resourceId, ticketId) =>
            seats.assign.mutate({ resourceId, ticketId })
          }
        />
      )}

      {hourly.data ? (
        <HourlySalesChart data={hourly.data} />
      ) : hourly.isLoading ? (
        <Skeleton className="h-56 rounded-[24px]" />
      ) : null}

      {payments.isLoading ? (
        <Skeleton className="h-48 rounded-[24px]" />
      ) : payments.error ? (
        <ErrorState
          message={(payments.error as Error).message}
          onRetry={() => void payments.refetch()}
        />
      ) : (
        <>
          <PaymentsTable rows={paymentRows} types={data.ticketTypes ?? []} />
          <TransactionsStatement eventTitle={data.title} rows={paymentRows} />
        </>
      )}
    </div>
  );
}
