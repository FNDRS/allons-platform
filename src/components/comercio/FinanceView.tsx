"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useProviderAccess } from "@/hooks/useProviderAccess";
import { useProviderLive } from "./ProviderLive";
import { listProviderEvents, providerKeys } from "@/lib/api/provider";
import { formatHNL, formatNumber } from "@/lib/format";
import { Card, SectionTitle } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/States";
import { glassCtaClass } from "@/components/ui/cta";
import { ComercioEventsListView } from "./ComercioEventsListView";
import { ProviderBillingForm } from "./ProviderBillingForm";
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

/**
 * The general picture across every event: totals from the dashboard endpoint
 * (already aggregated server side, so this stays cheap no matter how many
 * events a comercio has) plus a link into `/comercio/events` for the detail
 * of any one event. Per-event breakdown (ticket types, courtesy/discounted
 * tickets, sales over time) lives on that event's own page, not here.
 */
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
  const [showEvents, setShowEvents] = useState(false);

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
          </Card>
        </section>
      ) : null}

      <section>
        <button
          type="button"
          onClick={() => setShowEvents((current) => !current)}
          className={`inline-flex h-11 items-center gap-2 px-4 text-[14px] ${glassCtaClass}`}
        >
          {showEvents ? "Ocultar eventos" : "Ver mis eventos"}
          {showEvents ? (
            <ChevronUp className="size-4 text-white/45" strokeWidth={1.5} aria-hidden />
          ) : (
            <ChevronDown className="size-4 text-white/45" strokeWidth={1.5} aria-hidden />
          )}
        </button>
        {showEvents ? (
          <div className="mt-5">
            <ComercioEventsListView basePath="/comercio/finanzas" />
          </div>
        ) : null}
      </section>

      <SeatsChart events={events.data ?? []} loading={events.isLoading} />

      <ProviderBillingForm />
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
