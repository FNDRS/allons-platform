"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowUpRight, Building2, CalendarDays, Clock } from "lucide-react";
import { useProviderAccess } from "@/hooks/useProviderAccess";
import {
  getHourlySales,
  getProviderEvent,
  getProviderPayments,
  providerKeys,
} from "@/lib/api/provider";
import { formatCardDay, formatCardTime, formatHNL, formatNumber } from "@/lib/format";
import { StatusPill } from "@/components/ui/Pill";
import { ErrorState, Skeleton } from "@/components/ui/States";
import { PaymentsTable, TicketTypeTable } from "./EventTables";
import { HourlySalesChart } from "./HourlySalesChart";
import { KpiTile } from "./KpiTile";

const STATUS: Record<string, { label: string; tone: "solid" | "glass" | "mute" }> = {
  published: { label: "Publicado", tone: "solid" },
  draft: { label: "Borrador", tone: "glass" },
  sold_out: { label: "Agotado", tone: "mute" },
  ended: { label: "Finalizado", tone: "mute" },
};

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
  const status = STATUS[data.status] ?? { label: data.status, tone: "mute" as const };
  const day = formatCardDay(data.startsAt);
  const time = formatCardTime(data.startsAt);
  const place = [data.venue, data.city].filter(Boolean).join(", ");

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-5">
        <Link
          href="/comercio"
          className="inline-flex w-fit items-center gap-1.5 text-[13px] font-semibold text-white/45 transition hover:text-white"
        >
          <ArrowLeft className="size-4" /> Resumen
        </Link>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-[26px] font-bold leading-[1.1] tracking-[-0.03em] sm:text-[32px]">
                {data.title}
              </h1>
              <StatusPill tone={status.tone}>{status.label}</StatusPill>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-white/50">
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="size-3.5 text-white/35" aria-hidden />
                {day ?? "Sin fecha"}
              </span>
              {time ? (
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="size-3.5 text-white/35" aria-hidden />
                  {time}
                </span>
              ) : null}
              {place ? (
                <span className="inline-flex items-center gap-1.5">
                  <Building2 className="size-3.5 text-white/35" aria-hidden />
                  {place}
                </span>
              ) : null}
            </div>
          </div>
          <Link
            href={`/events/${encodeURIComponent(eventId)}`}
            className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full bg-white px-4 text-[13px] font-semibold tracking-tight text-black"
          >
            Ver página pública <ArrowUpRight className="size-4" aria-hidden />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
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
        <KpiTile label="Ingresos" value={formatHNL(data.revenue)} hint="Incluye aportes" />
        <KpiTile label="Aportes" value={formatHNL(data.contributions)} />
        <KpiTile
          label="Escaneados"
          value={formatNumber(data.scans)}
          hint={
            data.ticketsSold > 0
              ? `${Math.round((data.scans / data.ticketsSold) * 100)}% asistencia`
              : undefined
          }
        />
      </div>

      <TicketTypeTable types={data.ticketTypes ?? []} />

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
        <PaymentsTable rows={payments.data?.data ?? []} />
      )}
    </div>
  );
}
