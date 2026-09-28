"use client";

import { useQueries, useQuery } from "@tanstack/react-query";
import { useProviderAccess } from "@/hooks/useProviderAccess";
import { useProviderLive } from "./ProviderLive";
import {
  getProviderEvent,
  getProviderPayments,
  listProviderEvents,
  providerKeys,
} from "@/lib/api/provider";
import { formatHNL, formatNumber } from "@/lib/format";
import { Card, SectionTitle } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/States";
import { SalesTrendChart, type SalesTrendPoint } from "./SalesTrendChart";
import { SeatsChart } from "./SeatsChart";

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

/** The one number that matters: what the comercio will be paid. */
export function FinanceBalances({
  available,
  loading = false,
}: {
  available: number;
  loading?: boolean;
}) {
  if (loading) return <Skeleton className="h-24 w-64" />;
  return (
    <div>
      <p className="text-[13px] font-medium text-white/45">Ganancias</p>
      <p className="mt-1 text-[40px] font-bold leading-none tracking-[-0.045em] tabular-nums sm:text-[52px]">
        {formatHNL(available)}
      </p>
      <p className="mt-2 text-[13px] text-white/40">Después del evento</p>
    </div>
  );
}

export function FinanceView() {
  const { dashboard, dashboardLoading, ready } = useProviderAccess({
    withDashboard: true,
  });
  const { live } = useProviderLive();
  const events = useQuery({
    queryKey: providerKeys.events,
    queryFn: listProviderEvents,
    enabled: ready,
    refetchInterval: live ? false : 60_000,
  });

  const totals = dashboard?.totals;
  const commission = dashboard?.commission;

  const eventList = events.data ?? [];
  const paymentQueries = useQueries({
    queries: eventList.map((event) => ({
      queryKey: providerKeys.payments(event.id),
      queryFn: () => getProviderPayments(event.id),
      enabled: ready && eventList.length > 0,
    })),
  });
  const eventDetailQueries = useQueries({
    queries: eventList.map((event) => ({
      queryKey: providerKeys.event(event.id),
      queryFn: () => getProviderEvent(event.id),
      enabled: ready && eventList.length > 0,
    })),
  });
  const paymentsLoading = paymentQueries.some((query) => query.isLoading);
  const detailsLoading = eventDetailQueries.some((query) => query.isLoading);

  let courtesyTickets = 0;
  let courtesyValueCents = 0;
  const dayTotals = new Map<string, { cents: number; qty: number }>();
  eventList.forEach((event, index) => {
    const rows = paymentQueries[index]?.data?.data ?? [];
    const priceByType = new Map(
      (eventDetailQueries[index]?.data?.ticketTypes ?? []).map((type) => [type.id, type.price]),
    );
    for (const row of rows) {
      if (row.status !== "paid") continue;
      if (row.amountCents === 0) {
        courtesyTickets += row.quantity;
        const listPrice = row.entryTypeId ? priceByType.get(row.entryTypeId) ?? 0 : 0;
        courtesyValueCents += listPrice * row.quantity * 100;
      }
      const key = dayFmt.format(new Date(row.createdAt));
      const entry = dayTotals.get(key) ?? { cents: 0, qty: 0 };
      entry.cents += row.amountCents;
      entry.qty += row.quantity;
      dayTotals.set(key, entry);
    }
  });

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
      <FinanceBalances
        available={dashboard?.availableBalance ?? 0}
        loading={dashboardLoading}
      />

      {!dashboardLoading && totals ? (
        <section>
          <SectionTitle>Desglose</SectionTitle>
          <Card padding="none" className="divide-y divide-border">
            <Row label="Ingresos brutos" value={formatHNL(totals.gross)} />
            <Row
              label={
                commission?.planName
                  ? `Comisiones (${commission.planName})`
                  : "Comisiones"
              }
              value={`− ${formatHNL(totals.fees)}`}
              hint="Incluye la tarifa de Allons y la del procesador de pagos sobre lo efectivamente cobrado."
            />
            <Row label="Neto a liquidar" value={formatHNL(totals.net)} bold />
            <Row
              label="Boletos vendidos"
              value={formatNumber(totals.soldTickets)}
              muted
            />
            {!paymentsLoading && courtesyTickets > 0 ? (
              <Row
                label="Boletos de cortesía"
                value={`${formatNumber(courtesyTickets)} · ${detailsLoading ? "…" : `valor de lista ${formatHNL(courtesyValueCents / 100)}`}`}
                muted
                hint="Boletos entregados en L 0.00 por un código de descuento al 100%. Ya no forman parte de los ingresos brutos ni del neto — este es solo el valor de lista que hubieran tenido."
              />
            ) : null}
          </Card>
        </section>
      ) : null}

      <div className="grid items-start gap-8 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <SalesTrendChart points={salesTrend} loading={events.isLoading || paymentsLoading} />
        </div>
        <div className="lg:col-span-2">
          <SeatsChart events={eventList} loading={events.isLoading} />
        </div>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  bold = false,
  muted = false,
  hint,
}: {
  label: string;
  value: string;
  bold?: boolean;
  muted?: boolean;
  hint?: string;
}) {
  return (
    <div className="flex flex-col gap-1 px-5 py-4 text-[14px]">
      <div className="flex items-center justify-between gap-4">
        <span className={bold ? "font-bold text-white" : "text-white/70"}>{label}</span>
        <span
          className={`tabular-nums ${
            bold ? "font-bold text-white" : muted ? "text-white/40" : "text-white/85"
          }`}
        >
          {value}
        </span>
      </div>
      {hint ? <p className="text-[12px] text-white/40">{hint}</p> : null}
    </div>
  );
}
