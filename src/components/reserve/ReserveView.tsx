"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Lock } from "lucide-react";
import { useActivePaymentOrder } from "@/hooks/useActivePaymentOrder";
import { useCardCheckout } from "@/hooks/useCardCheckout";
import { useBuyerUnitPrices } from "@/hooks/useBuyerUnitPrices";
import { useReserveForm } from "@/hooks/useReserveForm";
import { useTurnstile } from "@/hooks/useTurnstile";
import { useAuth } from "@/components/app/AuthProvider";
import { formatEventWhen } from "@/lib/allons-api";
import { requiresAccount } from "@/lib/api/events";
import { Button, buttonClass } from "@/components/ui/Button";
import { PaymentsPausedButton } from "@/components/ui/PaymentsPaused";
import { PAYMENTS_OUTAGE } from "@/lib/paymentsOutage";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/States";
import { EventCover, EventPosterWash } from "@/components/events/EventCover";
import { PaymentMethodStep } from "@/components/pay/PaymentMethodStep";
import { ThreeDsChallenge } from "@/components/pay/ThreeDsChallenge";
import { HoldCountdown } from "./HoldCountdown";
import { GuestPendingOrderNotice } from "./GuestPendingOrderNotice";
import { PendingOrderNotice } from "./PendingOrderNotice";
import { ReserveAccountModal } from "./ReserveAccountModal";
import { ReserveBikePicker } from "./ReserveBikePicker";
import {
  BuyerCard,
  CampaignConsentField,
  DonationField,
  EntryTypePicker,
  GovernmentIdField,
  HolderCard,
  PromoCodeField,
  QuantityStepper,
  ReserveSummary,
  StepHeading,
} from "./ReserveSections";
import { formatCents, formatDateTime } from "@/lib/format";
import { scrollToFirstInvalid } from "@/lib/scroll-to-invalid";

export function ReserveView({ eventId }: { eventId: string }) {
  const params = useSearchParams();
  // Invisible anti-bot check for guests: a token per request, nothing on
  // screen unless Cloudflare asks for one click.
  const turnstile = useTurnstile();
  const form = useReserveForm(eventId, params.get("entrada"), turnstile.getToken);
  const listed = useBuyerUnitPrices(
    eventId,
    form.availableTypes,
    form.event?.feeMode,
  );
  // Two checkouts, chosen by the comercio per event. The simple one needs no
  // account: the buyer step asks name and email, the order answers to a
  // token this browser keeps, and the ticket arrives by mail. The full one
  // asks the buyer to sign in (email code or Google) before paying. A free
  // reservation always takes the account, since the API issues it to one.
  const { user, loading: authLoading } = useAuth();
  const ready = !authLoading;
  const isGuest = ready && !user;
  const accountRequired = requiresAccount(form.event) || form.isFree;
  const needsAccount = isGuest && accountRequired && !form.preview;
  // A promo code can cover the ticket in full; nothing is charged, so the
  // card step is as pointless there as it is on a genuinely free entry.
  const chargesNothing = form.isFree || form.effectivelyFree;
  // Saved cards load only for a signed-in buyer of a paid ticket; a guest
  // can still type a card when the deployment charges them directly.
  const checkout = useCardCheckout({
    userId: user?.id ?? null,
    enabled: ready && !chargesNothing && Boolean(form.entryType),
    directCard: form.cardPaymentEnabled,
    guestBuyer: isGuest && !accountRequired ? form.guestBuyer : null,
    proveHuman: turnstile.getToken,
    onOrderPlaced: () => {
      const buyer = form.guestBuyer();
      if (buyer) form.orderPlaced(buyer);
    },
  });
  const pendingOrder = useActivePaymentOrder(
    eventId,
    ready && Boolean(user) && !form.preview,
  );
  // While the account is still missing on a full checkout, nothing is
  // charged here: the CTA sends the buyer to the sign-in step instead.
  const payInApp =
    !chargesNothing && !needsAccount && checkout.available && checkout.cardReady;
  // While the card list loads the CTA must not send anyone to the hosted
  // page: the buyer is about to be offered the in-app card. Same while a
  // promo code is being priced: the total on screen (and what `submit`
  // would send) is still the pre-code figure until this settles.
  const submitting =
    form.submitting ||
    checkout.submitting ||
    form.paymentDataLoading ||
    (!chargesNothing && checkout.loading) ||
    form.promoApplying;
  // A background refetch blocks the charge too, but without the spinner or
  // the faded disabled look: it lands in a moment and repeats every 10s, so
  // the CTA should not flicker while the buyer is reading the total.
  const refreshing = !form.preview && !submitting && form.paymentDataRefreshing;
  const error = form.error ?? checkout.error;
  // Un paso más cuando la pasarela pide identidad; corre la numeración de abajo.
  // Con tarjeta en Allons no se pide: el DNI va en el formulario de la tarjeta.
  // Tampoco mientras cargan las tarjetas, para que no aparezca y desaparezca.
  // Not before the account step either: which channel will charge (and
  // whether it needs the id) is only known once the buyer is signed in.
  const showGovernmentId =
    form.needsGovernmentId &&
    !payInApp &&
    !needsAccount &&
    !(checkout.loading && !chargesNothing);

  const pageRef = useRef<HTMLDivElement>(null);
  // The sign-in asked for on "Reservar" when the event wants an account. It
  // sits over the filled form; once the session opens it closes and the
  // page scrolls to the payment step, right where the buyer left off. After
  // a Google round trip the same spot is restored from the flag below.
  const [accountOpen, setAccountOpen] = useState(false);
  useEffect(() => {
    if (!user) return;
    let resume = false;
    try {
      resume = window.sessionStorage.getItem(resumeKey(eventId)) === "1";
      window.sessionStorage.removeItem(resumeKey(eventId));
    } catch {
      /* nothing stored */
    }
    if (!accountOpen && !resume) return;
    setAccountOpen(false);
    window.setTimeout(() => {
      document
        .getElementById("reserve-pay")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 150);
  }, [user, accountOpen, eventId]);

  function onPay() {
    if (form.preview) return;
    if (needsAccount) {
      // Everything above the button must already be right: signing in is
      // the last step, not a way to find out a field is missing.
      if (!form.validateForAccount()) {
        scrollToFirstInvalid(pageRef.current);
        return;
      }
      setAccountOpen(true);
      return;
    }
    if (!payInApp) {
      void form.submit();
    } else {
      const input = form.preparePaidOrder();
      if (input) void checkout.pay(input);
    }
    scrollToFirstInvalid(pageRef.current);
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
  const back = `/eventos/${encodeURIComponent(eventId)}`;
  const opensAt =
    form.preview && form.entryType?.saleStartsAt
      ? formatDateTime(form.entryType.saleStartsAt)
      : null;
  const when = formatEventWhen(event.startsAt);
  const place = [event.venue, event.city].filter(Boolean).join(" · ");

  if (form.availableTypes.length === 0) {
    // The open order may hold the last seat; it stays payable either way.
    return (
      <div className="flex flex-col gap-6">
        {pendingOrder ? (
          <PendingOrderNotice order={pendingOrder} eventId={eventId} />
        ) : null}
        <EmptyState
          title="No hay entradas disponibles"
          body="Este evento está agotado o la venta está cerrada."
          action={
            <Link href={back} className={buttonClass({ variant: "secondary" })}>
              Volver al evento
            </Link>
          }
        />
      </div>
    );
  }

  // Step numbers follow what is on the page, so the buyer never sees a gap.
  let step = 2;
  const next = () => (step += 1);
  const bikesStep = form.hasResourceGroups ? next() : 0;
  // On a full checkout the account brings name and email, so before the
  // sign-in there is nothing to ask here unless the comercio has questions
  // for the buyer. After it, the step shows what the account gave.
  const showBuyerStep = !needsAccount || form.buyerQuestions.length > 0;
  const buyerStep = showBuyerStep ? next() : 0;
  // One ticket for the buyer with nothing to ask about them: no attendee
  // section at all. The ticket is theirs and the step would be empty.
  const soloBuyer =
    form.quantity === 1 && form.firstIsBuyer && form.questions.length === 0;
  const attendeesStep = soloBuyer ? 0 : next();
  const idStep = showGovernmentId ? next() : 0;
  const donationStep = form.donationAllowed ? next() : 0;
  const promoStep = form.isFree ? 0 : next();
  const summaryStep = next();
  const payStep = needsAccount ? 0 : next();
  const signInHref = `/login?next=${encodeURIComponent(
    `/eventos/${eventId}/reservar${params.toString() ? `?${params.toString()}` : ""}`,
  )}`;

  return (
    <div ref={pageRef} className="flex flex-col gap-10 pb-36 sm:gap-12">
      <header>
        <Link
          href={back}
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-white/40 transition duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:text-white"
        >
          <ArrowLeft className="size-3.5" strokeWidth={1.75} aria-hidden />
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
            <HoldCountdown expiresAt={form.holdExpiresAt} />
          </div>
        ) : null}

        {pendingOrder ? (
          <div className="mt-5">
            <PendingOrderNotice order={pendingOrder} eventId={eventId} />
          </div>
        ) : null}
        {form.guestPending ? (
          <div className="mt-5">
            <GuestPendingOrderNotice
              order={form.guestPending}
              eventId={eventId}
              busy={form.submitting}
              onDrop={() => void form.dropGuestPending()}
            />
          </div>
        ) : null}
      </header>

      <EntryTypePicker
        types={form.availableTypes}
        value={form.entryTypeId}
        onChange={form.setEntryTypeId}
        priceCentsFor={listed.priceCentsFor}
      />

      <QuantityStepper
        value={form.quantity}
        max={form.maxQuantity}
        onChange={form.setQuantity}
        step={2}
      />

      {form.hasResourceGroups ? (
        <ReserveBikePicker
          groups={form.resourceGroups}
          selectedByGroup={form.selectedResourceByGroup}
          quantity={form.quantity}
          step={bikesStep}
          error={
            form.touched && form.missingGroupName
              ? `Elige tu ${form.missingGroupName.toLowerCase()} antes de continuar.`
              : null
          }
          onToggle={form.onToggleResource}
        />
      ) : null}

      {showBuyerStep ? (
      <section>
        <StepHeading n={buyerStep} hint={needsAccount ? undefined : "Ahí llega tu ticket"}>
          {needsAccount ? "Sobre tu compra" : "Tus datos"}
        </StepHeading>
        <BuyerCard
          buyer={form.buyer}
          errors={form.buyerErrors}
          showErrors={form.touched}
          emailLocked={Boolean(user?.email)}
          emailFromAccount={needsAccount}
          questions={form.buyerQuestions}
          answers={form.buyerAnswers}
          onChange={form.setBuyer}
          onAnswer={form.setBuyerAnswer}
          signInHref={isGuest && !accountRequired ? signInHref : null}
        />
      </section>
      ) : null}

      {attendeesStep ? (
        <section>
          <StepHeading n={attendeesStep}>
            {form.quantity === 1 ? "Tu entrada" : "Asistentes"}
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
                isMe={false}
                forBuyer={index === 0 ? form.firstIsBuyer : undefined}
                onForBuyer={index === 0 ? form.setFirstIsBuyer : undefined}
                onChange={(patch) => form.updateHolder(index, patch)}
                onAnswer={(questionId, value) => form.setAnswer(index, questionId, value)}
              />
            ))}
          </div>
          {form.touched && form.duplicateEmail ? (
            <p data-scroll-target="invalid" className="mt-2 text-sm text-red-300">
              Cada ticket necesita un correo distinto.
            </p>
          ) : null}
        </section>
      ) : null}

      {showGovernmentId ? (
        <GovernmentIdField
          value={form.governmentId}
          onChange={form.setGovernmentId}
          step={idStep}
          showError={form.touched && !form.governmentIdValid}
          rejectedMessage={form.governmentIdRejectedMessage}
        />
      ) : null}

      {form.donationAllowed ? (
        <DonationField
          value={form.donation}
          onChange={form.setDonation}
          suggestedCents={form.suggestedDonationCents}
          step={donationStep}
        />
      ) : null}

      {!form.isFree ? (
        <PromoCodeField
          step={promoStep}
          value={form.promoCodeDraft}
          onChange={form.setPromoCodeDraft}
          onApply={form.applyPromoCode}
          onRemove={form.removePromoCode}
          applied={form.discount}
          applying={form.promoApplying}
          error={form.promoError}
        />
      ) : null}

      <section>
        <StepHeading n={summaryStep}>Tu compra</StepHeading>
        <ReserveSummary
          quantity={form.quantity}
          typeName={form.entryType?.name ?? ""}
          ticketsCents={form.ticketsCents}
          donationCents={form.donationAllowed ? form.donationCents : 0}
          serviceChargeCents={form.serviceChargeCents}
          discount={form.discount}
          totalCents={form.totalCents}
          isFree={form.isFree}
        />
      </section>

      <div id="reserve-pay" className="scroll-mt-6">
        {!needsAccount && !chargesNothing ? (
          <PaymentMethodStep step={payStep} checkout={checkout} />
        ) : null}
      </div>

      <CampaignConsentField
        campaigns={form.campaigns}
        checked={form.campaignConsent}
        onChange={form.setCampaignConsent}
        showError={form.touched}
      />

      {/* Again by the pay button: a refused order shows this instead of an
          error, and the one at the top is out of sight by now. */}
      {pendingOrder ? (
        <PendingOrderNotice order={pendingOrder} eventId={eventId} />
      ) : null}
      {form.guestPending ? (
        <GuestPendingOrderNotice
          order={form.guestPending}
          eventId={eventId}
          busy={form.submitting}
          onDrop={() => void form.dropGuestPending()}
        />
      ) : null}

      {error ? <ErrorState message={error} /> : null}

      {/* Where Turnstile draws its box when it needs a click; empty otherwise. */}
      <div ref={turnstile.container} className="flex justify-center empty:hidden" />

      {/* Informed consent before paying: the terms, the refund policy, the
          privacy notice and the event's own refund rules are linked right where
          the buyer commits. */}
      <p className="text-center text-[12px] leading-relaxed text-white/45">
        Al {chargesNothing ? "confirmar" : "pagar"} aceptas los{" "}
        <Link href="/terminos" target="_blank" className="underline underline-offset-2 hover:text-white">
          Términos y Condiciones
        </Link>
        , la{" "}
        <Link href="/reembolsos" target="_blank" className="underline underline-offset-2 hover:text-white">
          Política de Reembolsos
        </Link>{" "}
        y la{" "}
        <Link href="/privacidad" target="_blank" className="underline underline-offset-2 hover:text-white">
          Política de Privacidad
        </Link>{" "}
        de Allons, y compartes con el organizador los datos de los asistentes.
      </p>

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 px-4 pb-[max(14px,env(safe-area-inset-bottom))] sm:px-6">
        <div className="pointer-events-auto mx-auto flex max-w-2xl items-center gap-2 rounded-[28px] border border-white/10 bg-[#0a0a0b]/80 p-2 pl-4 shadow-[0_-20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:gap-3 sm:p-2.5 sm:pl-5">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-white/40">
              Total
            </p>
            <p className="truncate text-[18px] font-bold tracking-tight">
              {chargesNothing ? "Gratis" : formatCents(form.totalCents)}
            </p>
          </div>
          {PAYMENTS_OUTAGE && !chargesNothing && !form.preview ? (
            <PaymentsPausedButton className="min-w-0 !shrink sm:min-w-[11.5rem] sm:!shrink-0" />
          ) : (
          <Button
            size="lg"
            loading={form.preview ? false : submitting}
            disabled={form.preview || refreshing}
            onClick={onPay}
            className={`min-w-0 !shrink shadow-[0_10px_40px_rgba(246,112,16,0.28)] sm:min-w-[11.5rem] sm:!shrink-0 ${refreshing ? "disabled:!cursor-wait disabled:!opacity-100 disabled:!shadow-[0_10px_40px_rgba(246,112,16,0.28)]" : ""}`}
          >
            {form.preview
              ? "Reservar"
              : needsAccount
                ? "Reservar"
                : chargesNothing
                ? "Confirmar"
                : payInApp
                  ? `Pagar ${formatCents(form.totalCents)}`
                  : "Ir a pagar"}
          </Button>
          )}
        </div>
        {form.preview ? (
          <p className="mx-auto mt-2 max-w-2xl text-center text-[11px] text-white/40">
            {opensAt
              ? `A la venta desde ${opensAt} Reservar se habilita en ese momento.`
              : "Reservar se habilita cuando abra la venta."}
          </p>
        ) : !chargesNothing ? (
          <p className="mx-auto mt-2 flex max-w-2xl items-center justify-center gap-1.5 text-[11px] text-white/30">
            <Lock className="size-3" strokeWidth={1.75} aria-hidden />
            {payInApp
              ? "Cifrado y procesado por Paygate (Clinpays)"
              : "Pago seguro en Paygate"}
          </p>
        ) : null}
      </div>

      <ThreeDsChallenge
        challenge={checkout.threeDsChallenge}
        onDone={checkout.finishThreeDs}
      />

      <ReserveAccountModal
        open={accountOpen && needsAccount}
        onClose={() => setAccountOpen(false)}
        suggestedEmail={form.buyer.email}
        suggestedName={form.buyer.name}
        onName={form.setBuyerNameFromAccount}
        onLeave={() => {
          form.saveDraft();
          try {
            window.sessionStorage.setItem(resumeKey(eventId), "1");
          } catch {
            /* they scroll down themselves */
          }
        }}
      />
    </div>
  );
}

/** Set before leaving for Google: come back to the payment step, not the top. */
function resumeKey(eventId: string) {
  return `allons-reserve-resume:${eventId}`;
}
