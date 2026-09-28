"use client";

import { useQuery } from "@tanstack/react-query";
import { useProviderAccess } from "@/hooks/useProviderAccess";
import { useProviderLive } from "./ProviderLive";
import { listProviderEvents, providerKeys } from "@/lib/api/provider";
import { formatHNL, formatNumber } from "@/lib/format";
import { Card, SectionTitle } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/States";
import { EventRevenueChart } from "./EventRevenueChart";
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
            />
            <Row label="Neto a liquidar" value={formatHNL(totals.net)} bold />
            <Row
              label="Boletos vendidos"
              value={formatNumber(totals.soldTickets)}
              muted
            />
          </Card>
        </section>
      ) : null}

      <div className="grid items-start gap-8 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <EventRevenueChart
            events={events.data ?? []}
            loading={events.isLoading}
            error={events.error ? (events.error as Error).message : undefined}
            onRetry={() => void events.refetch()}
          />
        </div>
        <div className="lg:col-span-2">
          <SeatsChart events={events.data ?? []} loading={events.isLoading} />
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
}: {
  label: string;
  value: string;
  bold?: boolean;
  muted?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-4 text-[14px]">
      <span className={bold ? "font-bold text-white" : "text-white/70"}>{label}</span>
      <span
        className={`tabular-nums ${
          bold ? "font-bold text-white" : muted ? "text-white/40" : "text-white/85"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
