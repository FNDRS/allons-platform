"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
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
      <div className="flex flex-col gap-3">
        <Link href="/comercio" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-white">
          <ArrowLeft className="size-4" /> Resumen
        </Link>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-accent">
              {formatEventWhen(data.startsAt) ?? "Sin fecha"}
            </p>
            <h2 className="mt-1 text-[26px] font-bold leading-tight tracking-[-0.03em] sm:text-[32px]">{data.title}</h2>
            {data.venue || data.city ? (
              <p className="mt-1 text-sm text-muted">{[data.venue, data.city].filter(Boolean).join(" · ")}</p>
            ) : null}
          </div>
          <Link
            href={`/events/${encodeURIComponent(eventId)}`}
            className="inline-flex h-10 items-center gap-2 rounded-full border border-border bg-surface px-4 text-[13px] font-semibold text-muted transition hover:border-border-strong hover:text-white"
          >
            Ver página pública <ArrowUpRight className="size-4" aria-hidden />
          </Link>
        </div>
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
      ) : resources.error ? (
        <ErrorState
          message={`Recursos asignables: ${(resources.error as Error).message}`}
          onRetry={() => void resources.refetch()}
        />
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
