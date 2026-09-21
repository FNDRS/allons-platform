"use client";

import Link from "next/link";
import { ArrowLeft, Lock } from "lucide-react";
import { useReserveForm } from "@/hooks/useReserveForm";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { Button } from "@/components/ui/Button";
import { StepTitle } from "@/components/ui/Card";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/States";
import { HoldCountdown } from "./HoldCountdown";
import {
  DonationField,
  EntryTypePicker,
  HolderCard,
  QuantityStepper,
  ReserveSummary,
} from "./ReserveSections";

export function ReserveView({ eventId }: { eventId: string }) {
  const { ready, user } = useRequireAuth();
  const form = useReserveForm(eventId);

  if (!ready || form.isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-24" />
        <Skeleton className="h-40" />
      </div>
    );
  }
  if (form.loadError || !form.event) {
    return <ErrorState message={form.loadError?.message} onRetry={() => void form.refetch()} />;
  }

  const event = form.event;
  const back = `/events/${encodeURIComponent(eventId)}`;

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
    <div className="flex flex-col gap-7">
      <div>
        <Link href={back} className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-white">
          <ArrowLeft className="size-4" /> Volver al evento
        </Link>
        <p className="mt-4 text-[12px] font-semibold uppercase tracking-[0.2em] text-accent">Reservar</p>
        <h1 className="mt-1 text-[32px] font-bold leading-[1.05] tracking-[-0.03em] sm:text-[40px]">
          {event.title}
        </h1>
      </div>

      <EntryTypePicker
        types={form.availableTypes}
        value={form.entryTypeId}
        onChange={form.setEntryTypeId}
      />

      {form.holdExpiresAt ? (
        <HoldCountdown expiresAt={form.holdExpiresAt} onRestart={form.restartHold} />
      ) : null}

      <QuantityStepper value={form.quantity} max={form.maxQuantity} onChange={form.setQuantity} />

      <section>
        <StepTitle step={3}>Asistentes</StepTitle>
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
              isMe={Boolean(user?.email) && holder.email.trim().toLowerCase() === user?.email?.toLowerCase()}
              onChange={(patch) => form.updateHolder(index, patch)}
              onAnswer={(questionId, value) => form.setAnswer(index, questionId, value)}
            />
          ))}
        </div>
        {form.touched && form.duplicateEmail ? (
          <p className="mt-2 text-sm text-red-300">Cada ticket necesita un correo distinto.</p>
        ) : null}
      </section>

      {form.donationAllowed ? (
        <DonationField value={form.donation} onChange={form.setDonation} />
      ) : null}

      <section>
        <StepTitle step={5}>Resumen</StepTitle>
        <ReserveSummary
          quantity={form.quantity}
          typeName={form.entryType?.name ?? ""}
          ticketsCents={form.ticketsCents}
          donationCents={form.donationAllowed ? form.donationCents : 0}
          totalCents={form.totalCents}
          isFree={form.isFree}
        />
      </section>

      {form.error ? (
        <p className="rounded-2xl border border-red-500/25 bg-red-500/[0.08] px-4 py-3 text-sm text-red-200">
          {form.error}
        </p>
      ) : null}

      <div className="flex flex-col gap-3">
        <Button size="lg" full loading={form.submitting} onClick={() => void form.submit()}>
          {form.isFree ? "Confirmar reserva" : "Continuar al pago"}
        </Button>
        {!form.isFree ? (
          <p className="flex items-center justify-center gap-1.5 text-xs text-white/45">
            <Lock className="size-3.5" /> El pago se hace en la página segura de Paygate (Clinpays).
          </p>
        ) : null}
      </div>
    </div>
  );
}
