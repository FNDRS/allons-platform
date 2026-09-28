"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowUpRight, Building2, CalendarDays, Clock } from "lucide-react";
import { useProviderAccess } from "@/hooks/useProviderAccess";
import { useProviderResources } from "@/hooks/useProviderResources";
import {
  getHourlySales,
  getProviderEvent,
  getProviderPayments,
  providerKeys,
} from "@/lib/api/provider";
import { formatCardDay, formatCardTime, formatHNL, formatNumber } from "@/lib/format";
import { Card, SectionTitle } from "@/components/ui/Card";
import { ErrorState, Skeleton } from "@/components/ui/States";
import { glassCtaClass } from "@/components/ui/cta";
import { PaymentsTable } from "./EventTables";
import { HourlySalesChart } from "./HourlySalesChart";
import { KpiTile } from "./KpiTile";
import { ResourceMap } from "./ResourceMap";
import { ShareEventButton } from "./ShareEventButton";

const STATUS: Record<string, string> = {
  published: "Publicado",
  draft: "Borrador",
  sold_out: "Agotado",
  ended: "Finalizado",
};

const REFUND_POLICY: Record<string, string> = {
  none: "Sin reembolsos",
  full: "Reembolso completo",
  partial: "Reembolso parcial",
};

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-4 text-[14px]">
      <span className="text-white/70">{label}</span>
      <span className="text-right tabular-nums text-white/85">{value}</span>
    </div>
  );
}

/**
 * An event's own configuration and day-to-day operations: what it's called,
 * when and where it happens, its ticket types and list prices, its refund
 * policy, who's assigned to which seat, its order list, its sales activity
 * today. No money math here (gross/net/commissions): that lives on this
 * same event's Finanzas page instead, reached from Finanzas or Dashboard,
 * not from here.
 */
export function EventConfigView({ eventId }: { eventId: string }) {
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
  });
  const payments = useQuery({
    queryKey: providerKeys.payments(eventId),
    queryFn: () => getProviderPayments(eventId),
    enabled: ready,
  });
  const seats = useProviderResources(eventId, ready);

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
  const amenities = [
    data.smokingAllowed ? "Se permite fumar" : null,
    data.petFriendly ? "Pet friendly" : null,
    data.parkingAvailable ? "Con parqueo" : null,
  ].filter((label): label is string => Boolean(label));

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-5">
        <Link
          href="/comercio/events"
          className="inline-flex w-fit items-center gap-1.5 text-[13px] font-semibold text-white/45 transition hover:text-white"
        >
          <ArrowLeft className="size-4" aria-hidden /> Eventos
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

      <div className="grid grid-cols-2 gap-3">
        <KpiTile
          label="Vendidos"
          value={
            data.capacity > 0
              ? `${formatNumber(data.ticketsSold)} / ${formatNumber(data.capacity)}`
              : formatNumber(data.ticketsSold)
          }
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
      </div>

      {data.description ? (
        <section>
          <SectionTitle>Descripción</SectionTitle>
          <Card>
            <p className="whitespace-pre-line text-[14px] leading-relaxed text-white/70">
              {data.description}
            </p>
          </Card>
        </section>
      ) : null}

      <section>
        <SectionTitle>Detalles</SectionTitle>
        <Card padding="none" className="divide-y divide-border">
          <Field label="Capacidad" value={data.capacity > 0 ? data.capacity : "Sin límite"} />
          {data.category ? <Field label="Categoría" value={data.category} /> : null}
          <Field
            label="Política de reembolso"
            value={REFUND_POLICY[data.refundPolicy ?? "none"] ?? data.refundPolicy}
          />
          {data.minAge ? <Field label="Edad mínima" value={`${data.minAge}+`} /> : null}
          {amenities.length > 0 ? (
            <Field label="Comodidades" value={amenities.join(" · ")} />
          ) : null}
          {data.kitPickupInfo ? (
            <Field label="Entrega de kit" value={data.kitPickupInfo} />
          ) : null}
        </Card>
      </section>

      <section>
        <SectionTitle>Tipos de entrada</SectionTitle>
        {(data.ticketTypes ?? []).length === 0 ? (
          <Card>
            <p className="text-[14px] text-white/50">Sin tipos de entrada.</p>
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {(data.ticketTypes ?? []).map((type) => (
              <article
                key={type.id}
                className="rounded-[24px] border border-white/[0.08] bg-white/[0.03] p-4 sm:p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-[16px] font-semibold tracking-tight">{type.name}</p>
                  <p className="text-[15px] font-semibold tabular-nums">
                    {type.price > 0 ? formatHNL(type.price) : "Gratis"}
                  </p>
                </div>
                <p className="mt-1 text-[13px] text-white/50">
                  {type.total > 0 ? `${type.total} disponibles` : "Sin límite"}
                  {type.donationEnabled ? " · Admite aporte voluntario" : ""}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>

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
        <PaymentsTable
          rows={payments.data?.data ?? []}
          types={data.ticketTypes ?? []}
        />
      )}
    </div>
  );
}
