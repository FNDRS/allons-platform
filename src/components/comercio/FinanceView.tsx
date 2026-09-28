"use client";

import { useQueries, useQuery } from "@tanstack/react-query";
import { useProviderAccess } from "@/hooks/useProviderAccess";
import { useProviderLive } from "./ProviderLive";
import { getProviderPayments, listProviderEvents, providerKeys } from "@/lib/api/provider";
import { formatHNL, formatNumber } from "@/lib/format";
import { Card, SectionTitle } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/States";
import { TicketMixChart } from "./TicketMixChart";
import { SeatsChart } from "./SeatsChart";

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
  const paymentsLoading = paymentQueries.some((query) => query.isLoading);
  const ticketMix = eventList.map((event, index) => {
    const rows = paymentQueries[index]?.data?.data ?? [];
    let paid = 0;
    let courtesy = 0;
    for (const row of rows) {
      if (row.amountCents > 0) paid += row.quantity;
      else courtesy += row.quantity;
    }
    return { id: event.id, title: event.title, paid, courtesy };
  });
  const courtesyTickets = ticketMix.reduce((sum, event) => sum + event.courtesy, 0);

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
                value={formatNumber(courtesyTickets)}
                muted
                hint="Boletos entregados en L 0.00 (código de descuento al 100%). Ya están excluidos de los ingresos brutos."
              />
            ) : null}
          </Card>
        </section>
      ) : null}

      <div className="grid items-start gap-8 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <TicketMixChart events={ticketMix} loading={events.isLoading || paymentsLoading} />
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
