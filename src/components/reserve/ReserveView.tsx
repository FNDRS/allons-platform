"use client";

import Link from "next/link";
import { ArrowLeft, Lock } from "lucide-react";
import { useCardCheckout } from "@/hooks/useCardCheckout";
import { useReserveForm } from "@/hooks/useReserveForm";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { formatEventWhen } from "@/lib/allons-api";
import { Button } from "@/components/ui/Button";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/States";
import { EventCover, EventPosterWash } from "@/components/events/EventCover";
import { PaymentMethodStep } from "@/components/pay/PaymentMethodStep";
import { HoldCountdown } from "./HoldCountdown";
import { ReserveBikePicker } from "./ReserveBikePicker";
import {
  DonationField,
  EntryTypePicker,
  HolderCard,
  QuantityStepper,
  ReserveSummary,
  StepHeading,
} from "./ReserveSections";
import { formatCents } from "@/lib/format";

export function ReserveView({ eventId }: { eventId: string }) {
  const { ready, user } = useRequireAuth();
  const form = useReserveForm(eventId);
  // Saved cards load only for a paid ticket; a free one never shows the step.
  const checkout = useCardCheckout({
    userId: user?.id ?? null,
    enabled: ready && !form.isFree && Boolean(form.entryType),
  });
  const payInApp = !form.isFree && checkout.available && checkout.cardReady;
  // While the card list loads the CTA must not send anyone to the hosted
  // page: the buyer is about to be offered the in-app card.
  const submitting = form.submitting || checkout.submitting || (!form.isFree && checkout.loading);
  const error = form.error ?? checkout.error;

  function onPay() {
    if (!payInApp) {
      void form.submit();
      return;
    }
    const input = form.preparePaidOrder();
    if (input) void checkout.pay(input);
  }

  if (!ready || form.isLoading) {
    return (
      <div className="flex flex-col gap-5">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-20 w-3/4" />
        <Skeleton className="h-28" />
        <Skeleton className="h-40" />
      </div>
    );
  }
  if (form.loadError || !form.event) {
    return (
      <ErrorState
        message={form.loadError?.message}
        onRetry={() => void form.refetch()}
      />
    );
  }

  const event = form.event;
  const back = `/events/${encodeURIComponent(eventId)}`;
  const when = formatEventWhen(event.startsAt);
  const place = [event.venue, event.city].filter(Boolean).join(" · ");

  if (form.availableTypes.length === 0) {
    return (
      <EmptyState
        title="No hay entradas disponibles"
        body="Este evento está agotado o la venta está cerrada."
        action={
          <Link href={back}>
            <Button variant="secondary">Volver al evento</Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-10 pb-36 sm:gap-12">
      <header>
        <Link
          href={back}
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-white/40 transition duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:text-white"
        >
          <ArrowLeft className="size-3.5" strokeWidth={1.75} />
          Volver al evento
        </Link>

        <div className="mt-6 flex items-start gap-4 sm:gap-5">
          <div className="relative h-[72px] w-[128px] shrink-0 overflow-hidden rounded-[18px] bg-black ring-1 ring-white/10 sm:h-[88px] sm:w-[156px]">
            {event.coverImageUrl ? (
              <EventCover
                src={event.coverImageUrl}
                alt=""
                themeColor={event.themeColor}
                fit="contain"
              />
            ) : (
              <EventPosterWash themeColor={event.themeColor} />
            )}
          </div>
          <div className="min-w-0 pt-0.5">
            <h1 className="break-words text-[24px] font-bold leading-[1.05] tracking-[-0.04em] sm:text-[36px]">
              {event.title}
            </h1>
            {when || place ? (
              <p className="mt-2 text-[13px] leading-5 text-white/45">
                {[when, place].filter(Boolean).join(" · ")}
              </p>
            ) : null}
          </div>
        </div>

        {form.holdExpiresAt ? (
          <div className="mt-5">
            <HoldCountdown
              expiresAt={form.holdExpiresAt}
              onRestart={form.restartHold}
            />
          </div>
        ) : null}
      </header>

      <EntryTypePicker
        types={form.availableTypes}
        value={form.entryTypeId}
        onChange={form.setEntryTypeId}
      />

      <QuantityStepper
        value={form.quantity}
        max={form.maxQuantity}
        onChange={form.setQuantity}
      />

      {form.hasResourceGroups ? (
        <ReserveBikePicker
          groups={form.resourceGroups}
          selectedByGroup={form.selectedResourceByGroup}
          quantity={form.quantity}
          step={3}
          error={
            form.touched && form.missingGroupName
              ? `Elige tu ${form.missingGroupName.toLowerCase()} antes de continuar.`
              : null
          }
          onToggle={form.onToggleResource}
        />
      ) : null}

      <section>
        <StepHeading n={3 + (form.hasResourceGroups ? 1 : 0)}>
          Asistentes
        </StepHeading>
        <div className="flex flex-col gap-3">
          {form.holders.map((holder, index) => (
            <HolderCard
              key={index}
              index={index}
              holder={holder}
              errors={form.holderErrors[index]}
              showErrors={form.touched}
              questions={form.questions}
              typeName={form.entryType?.name ?? ""}
              isMe={
                Boolean(user?.email) &&
                holder.email.trim().toLowerCase() === user?.email?.toLowerCase()
              }
              onChange={(patch) => form.updateHolder(index, patch)}
              onAnswer={(questionId, value) => form.setAnswer(index, questionId, value)}
            />
          ))}
        </div>
        {form.touched && form.duplicateEmail ? (
          <p className="mt-2 text-sm text-red-300">
            Cada ticket necesita un correo distinto.
          </p>
        ) : null}
      </section>

      {form.donationAllowed ? (
        <DonationField
          value={form.donation}
          onChange={form.setDonation}
          step={4 + (form.hasResourceGroups ? 1 : 0)}
        />
      ) : null}

      <section>
        <StepHeading
          n={
            (form.donationAllowed ? 5 : 4) + (form.hasResourceGroups ? 1 : 0)
          }
        >
          Tu compra
        </StepHeading>
        <ReserveSummary
          quantity={form.quantity}
          typeName={form.entryType?.name ?? ""}
          ticketsCents={form.ticketsCents}
          donationCents={form.donationAllowed ? form.donationCents : 0}
          totalCents={form.totalCents}
          isFree={form.isFree}
        />
      </section>

      {!form.isFree ? (
        <PaymentMethodStep
          step={(form.donationAllowed ? 6 : 5) + (form.hasResourceGroups ? 1 : 0)}
          checkout={checkout}
        />
      ) : null}

      {error ? <ErrorState message={error} /> : null}

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 px-4 pb-[max(14px,env(safe-area-inset-bottom))] sm:px-6">
        <div className="pointer-events-auto mx-auto flex max-w-2xl items-center gap-2 rounded-[28px] border border-white/10 bg-[#0a0a0b]/80 p-2 pl-4 shadow-[0_-20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:gap-3 sm:p-2.5 sm:pl-5">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-white/40">
              Total
            </p>
            <p className="truncate text-[18px] font-bold tracking-tight">
              {form.isFree ? "Gratis" : formatCents(form.totalCents)}
            </p>
          </div>
          <Button
            size="lg"
            loading={submitting}
            onClick={onPay}
            className="min-w-0 shrink-0 shadow-[0_10px_40px_rgba(246,112,16,0.28)] sm:min-w-[11.5rem]"
          >
            {form.isFree
              ? "Confirmar"
              : payInApp
                ? `Pagar ${formatCents(form.totalCents)}`
                : "Ir a pagar"}
          </Button>
        </div>
        {!form.isFree ? (
          <p className="mx-auto mt-2 flex max-w-2xl items-center justify-center gap-1.5 text-[11px] text-white/30">
            <Lock className="size-3" strokeWidth={1.75} />
            {payInApp
              ? "Cifrado y procesado por Paygate (Clinpays)"
              : "Pago seguro en Paygate"}
          </p>
        ) : null}
      </div>
    </div>
  );
}
