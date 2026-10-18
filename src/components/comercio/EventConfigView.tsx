"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowUpRight, Building2, CalendarDays, Clock, Pencil } from "lucide-react";
import { useAuth } from "@/components/app/AuthProvider";
import { buttonClass } from "@/components/ui/Button";
import { eventStatusLabel, isLiveEventStatus } from "@/lib/eventStatus";
import { canManageEvents } from "@/lib/role";
import { useProviderAccess } from "@/hooks/useProviderAccess";
import { useProviderResources } from "@/hooks/useProviderResources";
import {
  getHourlySales,
  getProviderEvent,
  getProviderPayments,
  providerKeys,
  type ProviderTicketType,
} from "@/lib/api/provider";
import {
  formatCardDay,
  formatCardTime,
  formatDateTime,
  formatHNL,
  formatNumber,
} from "@/lib/format";
import { Card, SectionTitle } from "@/components/ui/Card";
import { Progress } from "@/components/ui/Stat";
import { ErrorState, Skeleton } from "@/components/ui/States";
import { glassCtaClass } from "@/components/ui/cta";
import { EventAnswersSection } from "./EventAnswersSection";
import { HourlySalesChart } from "./HourlySalesChart";
import { KpiTile } from "./KpiTile";
import { OrdersSection } from "./OrdersSection";
import { ResourceMap } from "./ResourceMap";
import { EventCollaboratorsSection } from "./EventCollaboratorsSection";
import { ReviewStatusBanner } from "./ReviewStatusBanner";
import { ShareEventButton } from "./ShareEventButton";

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
/** A bundle session's own date and venue, when the ticket type has them. */
function sessionLine(type: ProviderTicketType): string | null {
  const parts = [formatDateTime(type.startsAt), type.venue?.trim() || null].filter(Boolean);
  return parts.length ? parts.join(" · ") : null;
}

export function EventConfigView({ eventId }: { eventId: string }) {
  const { ready } = useProviderAccess();
  const { user } = useAuth();
  const [hourlyDate, setHourlyDate] = useState<string | undefined>(undefined);
  const event = useQuery({
    queryKey: providerKeys.event(eventId),
    queryFn: () => getProviderEvent(eventId),
    enabled: ready,
  });
  const hourly = useQuery({
    queryKey: providerKeys.hourly(eventId, hourlyDate),
    queryFn: () => getHourlySales(eventId, hourlyDate),
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
  // Only fetch answers when the event asks its own questions.
  const ownQuestions = (data.questions ?? []).some(
    (question) => !question.campaignQuestionId,
  );
  const status = eventStatusLabel(data.status);
  // Only the hosting comercio edits; a collaborator reads the same page.
  const canEdit = data.access === "owner" && canManageEvents(user);
  const editHref = `/comercio/events/${encodeURIComponent(eventId)}/editar`;
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
            <p className="mt-2 text-[13px] text-white/40">
              {status}
              {data.access === "collaborator" && data.host
                ? ` · Organiza ${data.host.name}`
                : ""}
            </p>
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
            {canEdit ? (
              <Link href={editHref} className={buttonClass({ size: "sm", className: "w-full sm:w-auto" })}>
                <Pencil className="size-4" aria-hidden />
                Editar evento
              </Link>
            ) : null}
            {/* Not public until approved: no share link or public page yet. */}
            {isLiveEventStatus(data.status) ? (
              <>
                <ShareEventButton eventId={eventId} title={data.title} />
                <Link
                  href={`/eventos/${encodeURIComponent(eventId)}`}
                  className={`inline-flex h-10 w-full shrink-0 items-center justify-center gap-1.5 px-4 text-[13px] sm:w-auto ${glassCtaClass}`}
                >
                  Ver página pública
                  <ArrowUpRight className="size-3.5 text-white/45" strokeWidth={1.5} aria-hidden />
                </Link>
              </>
            ) : null}
          </div>
        </div>
        <ReviewStatusBanner
          kind="evento"
          status={data.status}
          rejectReason={data.reviewRejectReason}
          editHref={canEdit ? editHref : null}
        />
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

      <EventCollaboratorsSection eventId={eventId} enabled={ready} />

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
                  <div className="min-w-0">
                    <p className="text-[16px] font-semibold tracking-tight">{type.name}</p>
                    {sessionLine(type) ? (
                      <p className="mt-0.5 text-[13px] text-white/50">{sessionLine(type)}</p>
                    ) : null}
                  </div>
                  <p className="shrink-0 text-[15px] font-semibold tabular-nums">
                    {type.price > 0 ? formatHNL(type.price) : "Gratis"}
                  </p>
                </div>
                <div className="mt-3 flex items-baseline justify-between gap-3 text-[13px]">
                  <p className="tabular-nums text-white/80">
                    <span className="font-semibold text-white">{formatNumber(type.sold)}</span>
                    {type.total > 0 ? (
                      <span className="text-white/40"> / {formatNumber(type.total)}</span>
                    ) : null}{" "}
                    {type.price > 0 ? "vendidos" : "registrados"}
                  </p>
                  <p className="shrink-0 tabular-nums text-white/45">
                    {type.total > 0
                      ? `${formatNumber(Math.max(0, type.total - type.sold))} disponibles`
                      : "Sin límite"}
                  </p>
                </div>
                {type.total > 0 ? (
                  <div className="mt-2.5">
                    <Progress value={type.sold} max={type.total} />
                  </div>
                ) : null}
                {type.donationEnabled ? (
                  <p className="mt-2.5 text-[12px] text-white/40">Admite aporte voluntario</p>
                ) : null}
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
        <HourlySalesChart
          data={hourly.data}
          selectedDate={hourlyDate}
          onSelectDate={setHourlyDate}
        />
      ) : hourly.isLoading ? (
        <Skeleton className="h-56 rounded-[24px]" />
      ) : null}

      {ownQuestions ? (
        <EventAnswersSection eventId={eventId} enabled={ready} />
      ) : null}

      {payments.isLoading ? (
        <Skeleton className="h-48 rounded-[24px]" />
      ) : payments.error ? (
        <ErrorState
          message={(payments.error as Error).message}
          onRetry={() => void payments.refetch()}
        />
      ) : (
        <OrdersSection
          eventTitle={data.title}
          rows={payments.data?.data ?? []}
          reservations={payments.data?.reservations ?? []}
          types={data.ticketTypes ?? []}
        />
      )}
    </div>
  );
}
