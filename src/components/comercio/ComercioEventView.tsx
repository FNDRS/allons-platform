"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { useProviderAccess } from "@/hooks/useProviderAccess";
import { useProviderResources } from "@/hooks/useProviderResources";
import { formatEventWhen } from "@/lib/allons-api";
import {
  getHourlySales,
  getProviderEvent,
  getProviderPayments,
  providerKeys,
} from "@/lib/api/provider";
import { formatHNL, formatNumber } from "@/lib/format";
import { ErrorState, Skeleton } from "@/components/ui/States";
import { PaymentsTable, TicketTypeTable } from "./EventTables";
import { HourlySalesChart } from "./HourlySalesChart";
import { KpiTile } from "./KpiTile";
import { ResourceGroupEditor } from "./ResourceGroupEditor";
import { ResourceMap } from "./ResourceMap";

export function ComercioEventView({ eventId }: { eventId: string }) {
  const { ready } = useProviderAccess();
  const event = useQuery({
    queryKey: providerKeys.event(eventId),
    queryFn: () => getProviderEvent(eventId),
    enabled: ready,
  });
  const hourly = useQuery({
    queryKey: providerKeys.hourly(eventId),
    queryFn: () => getHourlySales(eventId),
    enabled: ready,
    refetchInterval: 60_000,
  });
  const payments = useQuery({
    queryKey: providerKeys.payments(eventId),
    queryFn: () => getProviderPayments(eventId),
    enabled: ready,
  });
  const resources = useProviderResources(eventId, ready);

  if (event.isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-28" />
        <Skeleton className="h-64" />
      </div>
    );
  }
  if (event.error || !event.data) {
    return <ErrorState message={(event.error as Error | null)?.message} onRetry={() => void event.refetch()} />;
  }
  const data = event.data;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Link href="/comercio" className="inline-flex items-center gap-1.5 text-sm text-white/55 hover:text-white">
          <ArrowLeft className="size-4" /> Resumen
        </Link>
        <p className="mt-3 text-xs font-semibold uppercase tracking-[0.3em] text-accent">
          {formatEventWhen(data.startsAt) ?? "Sin fecha"}
        </p>
        <h1 className="mt-1 text-3xl font-semibold leading-tight tracking-[-0.04em] sm:text-4xl">{data.title}</h1>
        {data.venue || data.city ? (
          <p className="mt-1 text-sm text-white/55">{[data.venue, data.city].filter(Boolean).join(" · ")}</p>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiTile
          label="Vendidos"
          value={data.capacity > 0 ? `${formatNumber(data.ticketsSold)} / ${formatNumber(data.capacity)}` : formatNumber(data.ticketsSold)}
          hint={data.capacity > 0 ? `${Math.round((data.ticketsSold / data.capacity) * 100)}% de la capacidad` : undefined}
        />
        <KpiTile label="Ingresos" value={formatHNL(data.revenue)} hint="Incluye aportes" />
        <KpiTile label="Aportes" value={formatHNL(data.contributions)} />
        <KpiTile label="Escaneados" value={formatNumber(data.scans)} hint={data.ticketsSold > 0 ? `${Math.round((data.scans / data.ticketsSold) * 100)}% asistencia` : undefined} />
      </div>

      <TicketTypeTable types={data.ticketTypes ?? []} />

      {hourly.data ? (
        <HourlySalesChart data={hourly.data} />
      ) : hourly.isLoading ? (
        <Skeleton className="h-56" />
      ) : null}

      {resources.isLoading ? (
        <Skeleton className="h-40" />
      ) : (
        <>
          <ResourceMap
            groups={resources.groups}
            busy={resources.assign.isPending || resources.release.isPending}
            onRelease={(resourceId) => resources.release.mutate(resourceId)}
            onAssign={(resourceId, ticketId) => resources.assign.mutate({ resourceId, ticketId })}
          />
          <ResourceGroupEditor
            groups={resources.groups}
            saving={resources.sync.isPending}
            onSave={(input) => resources.sync.mutate(input)}
          />
        </>
      )}

      {payments.isLoading ? (
        <Skeleton className="h-48" />
      ) : payments.error ? (
        <ErrorState message={(payments.error as Error).message} onRetry={() => void payments.refetch()} />
      ) : (
        <PaymentsTable rows={payments.data?.data ?? []} />
      )}
    </div>
  );
}
