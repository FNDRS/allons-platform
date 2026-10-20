"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useEffect, useMemo, useState } from "react";
import { usePaymentMethods } from "@/hooks/usePaymentMethods";
import { isApiError } from "@/lib/api/client";
import {
  enrollCard,
  paymentMethodKeys,
  removePaymentMethod,
  type PaymentMethodList,
} from "@/lib/api/paymentMethods";
import {
  GUEST_CARD_PAUSED_CODE,
  guestChargeWithCard,
  rememberGuestOrder,
  type GuestBuyer,
} from "@/lib/api/guest";
import {
  chargeWithCard,
  chargeWithSavedCard,
  rememberPendingOrder,
  type DirectCardInput,
  type InitiatePaymentInput,
} from "@/lib/api/payments";
import {
  EMPTY_CARD_DRAFT,
  detectBrand,
  digitsOnly,
  parseExpiry,
  validateCardDraft,
  type CardDraft,
} from "@/lib/cards";
import { handOffToBank } from "@/lib/threeDs";

/** What a card charge answers, whatever was bought. */
export type CardChargeResult = {
  orderId: string;
  status: "paid" | "failed" | "pending";
  redirectData?: string | null;
  /** Set on a guest charge: how this browser reads the order back. */
  guestToken?: string | null;
  buyerEmail?: string;
};

/** A saved card id, or "new" for the form. */
export type CardChoice = string;

const DECLINED_MESSAGE = "Tu banco rechazó la tarjeta. Prueba con otra.";

/**
 * Everything behind the "Pago" step: which card, the new-card draft, and the
 * settle flow (vault the card, charge it, hand off to /pagar). Card data lives
 * only in React state and is wiped after every attempt.
 */
export function useCardCheckout({
  userId,
  enabled,
  directCard = false,
  guestBuyer = null,
  proveHuman,
  onOrderPlaced,
  onGuestPending,
  onGuestUnavailable,
}: {
  userId: string | null;
  enabled: boolean;
  /**
   * The API can charge a typed card without saving it. Used when saving
   * cards is off (BAC cannot charge saved ones): the card form stays on the
   * page, with no option to keep the card.
   */
  directCard?: boolean;
  /**
   * Who is paying when there is no account. Resolved at pay time, so the
   * form can still be edited; null means the buyer is signed in (or the
   * buyer step is not valid yet).
   */
  guestBuyer?: (() => GuestBuyer | null) | null;
  /** Runs the invisible anti-bot check for a guest charge. */
  proveHuman?: () => Promise<string | null>;
  /** The order exists and the buyer is about to leave for `/pagar`. */
  onOrderPlaced?: (orderId: string) => void;
  /**
   * A guest's own checkout is still open and the API refused this one.
   * Returns true when the caller now shows the notice for it.
   */
  onGuestPending?: (err: unknown) => boolean;
  /** Guest checkout is off on this deployment; the form switches to the account. */
  onGuestUnavailable?: (err: unknown) => boolean;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isGuest = !userId;
  const saved = usePaymentMethods({ userId, enabled: enabled && !isGuest });
  // A guest has no vault, so only the typed card can be charged.
  const direct = directCard && (isGuest || !saved.enrollmentEnabled);
  const canEnterCard = saved.enrollmentEnabled || direct;
  const needsIdNumber = saved.needsIdNumber && !direct;
  const listKey = paymentMethodKeys.list(userId ?? "");

  const [choice, setChoice] = useState<CardChoice>("new");
  const [draft, setDraft] = useState<CardDraft>(EMPTY_CARD_DRAFT);
  // Opt in, never opt out: a card is kept only when the buyer asks.
  const [saveCard, setSaveCard] = useState(false);
  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  // The API paused guest card charges (a run of declines). The step hides
  // and the checkout falls back to the hosted form for this visit.
  const [paused, setPaused] = useState(false);

  // Preselect the default card once the list lands, so a returning buyer
  // pays in one tap. Only runs while the buyer has not picked anything.
  const [autoPicked, setAutoPicked] = useState(false);
  useEffect(() => {
    if (autoPicked || !saved.available) return;
    const preferred = saved.cards.find((card) => card.isDefault) ?? saved.cards[0];
    if (preferred) setChoice(preferred.id);
    setAutoPicked(true);
  }, [autoPicked, saved.available, saved.cards]);

  // The list can lose the chosen card under us (removed from the app or
  // another tab): fall back rather than posting an id the API will 404.
  const effectiveChoice: CardChoice = useMemo(() => {
    if (choice === "new") return canEnterCard ? "new" : "";
    if (saved.cards.some((card) => card.id === choice)) return choice;
    const fallback = saved.cards.find((card) => card.isDefault) ?? saved.cards[0];
    if (fallback) return fallback.id;
    return canEnterCard ? "new" : "";
  }, [choice, saved.cards, canEnterCard]);

  const digits = digitsOnly(draft.number);
  const brand = detectBrand(digits);
  const errors = useMemo(
    () => validateCardDraft(draft, { needsIdNumber }),
    [draft, needsIdNumber],
  );
  const draftValid = Object.keys(errors).length === 0;
  const usingNewCard = effectiveChoice === "new";
  /** A card (saved or new) is selected and can actually be charged. */
  const cardReady = effectiveChoice !== "";

  function updateDraft(patch: Partial<CardDraft>) {
    setDraft((current) => ({ ...current, ...patch }));
    if (error) setError(null);
  }

  /**
   * Settles an event order with the chosen card. Returns once the buyer has
   * been sent to /pagar or an error is showing.
   */
  function pay(input: InitiatePaymentInput) {
    return settle(
      (paymentMethodId) => chargeWithSavedCard({ ...input, paymentMethodId }),
      (orderId) =>
        `/pagar/${encodeURIComponent(orderId)}?event=${encodeURIComponent(input.eventId)}`,
      async (card) => {
        if (!isGuest) return chargeWithCard({ ...input, card });
        const buyer = guestBuyer?.() ?? null;
        if (!buyer) throw new Error("Completa tus datos antes de pagar.");
        const turnstileToken = proveHuman ? await proveHuman() : null;
        return guestChargeWithCard({
          ...input,
          buyer,
          card,
          ...(turnstileToken ? { turnstileToken } : {}),
        });
      },
      input.eventId,
    );
  }

  /**
   * Charges the chosen card through `charge` (an event order, a class
   * package) and then sends the buyer to `hrefFor(orderId)`.
   */
  async function settle(
    charge: (paymentMethodId: string) => Promise<CardChargeResult>,
    hrefFor: (orderId: string) => string,
    /** Charges the typed card without saving it; needed in direct mode. */
    chargeDirect?: (card: DirectCardInput) => Promise<CardChargeResult>,
    /** The event, so a refusal over an open checkout shows its notice instead. */
    eventId?: string,
  ) {
    setTouched(true);
    setError(null);
    if (!cardReady) {
      setError("Elige cómo quieres pagar.");
      return;
    }
    if (usingNewCard && !draftValid) {
      setError("Revisa los datos de la tarjeta.");
      return;
    }
    setSubmitting(true);
    let enrolledId: string | null = null;
    let paidOrderId: string | null = null;
    // The bank's page took the tab; nothing here may touch the form again.
    let handedOff = false;
    try {
      let result: CardChargeResult;
      if (usingNewCard && direct) {
        const expiry = parseExpiry(draft.expiry);
        if (!expiry) throw new Error("Fecha inválida");
        if (!chargeDirect) throw new Error("Este pago no acepta tarjeta nueva.");
        result = await chargeDirect({
          cardholderName: draft.name.trim(),
          cardNumber: digits,
          expMonth: expiry.month,
          expYear: expiry.year,
          cvv: draft.cvv,
        });
      } else {
        let paymentMethodId = effectiveChoice;
        if (usingNewCard) {
          const expiry = parseExpiry(draft.expiry);
          if (!expiry) throw new Error("Fecha inválida");
          const card = await enrollCard({
            cardholderName: draft.name.trim(),
            cardNumber: digits,
            expMonth: expiry.month,
            expYear: expiry.year,
            cvv: draft.cvv,
            ...(saved.needsIdNumber ? { idNumber: digitsOnly(draft.idNumber) } : {}),
          });
          enrolledId = card.id;
          paymentMethodId = card.id;
          // The card is in the vault now: a retry after a failed charge must
          // charge it, not vault the same number again.
          if (saveCard) {
            setChoice(card.id);
            queryClient.setQueryData(listKey, (current: PaymentMethodList | undefined) =>
              current && !current.data.some((row) => row.id === card.id)
                ? { ...current, data: [...current.data, card], needsIdNumber: false }
                : current,
            );
          }
        }

        result = await charge(paymentMethodId);
      }
      // A guest's order answers only to its token: keep it before anything
      // else can fail, so the paid page (and the return from the bank) can
      // read it.
      if (result.guestToken) {
        rememberGuestOrder(result.orderId, {
          token: result.guestToken,
          eventId: eventId ?? null,
          email: result.buyerEmail ?? null,
        });
      }
      if (result.status === "failed") {
        setError(DECLINED_MESSAGE);
        return;
      }
      // The order exists from here on, whatever the bank answers next: the
      // form's draft is spent and the buyer's details are worth keeping.
      onOrderPlaced?.(result.orderId);
      // The bank asked for 3DS. Its page takes over the tab and sends the
      // buyer back to /pagar, which reads the outcome. A one-off card has to
      // stay in the vault until the bank answers, so /pagar drops it then.
      if (result.status === "pending" && result.redirectData) {
        const href = hrefFor(result.orderId);
        handedOff = true;
        handOffToBank({
          orderId: result.orderId,
          html: result.redirectData,
          returnHref: `${href}${href.includes("?") ? "&" : "?"}pago=tarjeta`,
          dropCardId: enrolledId && !saveCard ? enrolledId : null,
        });
        return;
      }
      paidOrderId = result.orderId;
    } catch (err) {
      if (isApiError(err) && err.code === GUEST_CARD_PAUSED_CODE) setPaused(true);
      // A guest's open checkout has its own notice; the signed-in one reads
      // `/me` queries a guest cannot make.
      const covered = isGuest
        ? Boolean(onGuestPending?.(err)) || Boolean(onGuestUnavailable?.(err))
        : Boolean(eventId) && rememberPendingOrder(queryClient, eventId as string, err);
      if (!covered) setError(messageFor(err));
    } finally {
      // The buyer did not ask to keep the card: drop it from the vault
      // whether the charge went through or not, before leaving the page.
      // One retry, then the buyer is told so the card does not linger as
      // a silent one-tap option. Not when the bank has the tab: the card is
      // still being charged, and the form must stay locked while we leave.
      if (!handedOff && enrolledId && !saveCard) {
        const removed = await removePaymentMethod(enrolledId)
          .catch(() => removePaymentMethod(enrolledId as string))
          .then(() => true)
          .catch(() => false);
        if (!removed) {
          toast.warning(
            "No pudimos quitar la tarjeta de la bóveda de Paygate. Escríbenos a soporte para eliminarla.",
            { duration: 10_000 },
          );
        }
      }
      if (!handedOff && enrolledId) {
        void queryClient.invalidateQueries({ queryKey: listKey });
      }
      // Only a completed payment wipes the form; a decline or an error
      // keeps everything but the CVV so the buyer can fix one field.
      if (!handedOff) {
        setDraft(
          paidOrderId ? EMPTY_CARD_DRAFT : (current) => ({ ...current, cvv: "" }),
        );
        setSubmitting(false);
      }
    }
    if (paidOrderId) {
      // `pago=tarjeta` tells /pagar this order has no Paygate link and only
      // waits on the bank's 3DS answer, whatever the order is for.
      const href = hrefFor(paidOrderId);
      router.replace(`${href}${href.includes("?") ? "&" : "?"}pago=tarjeta`);
    }
  }

  /** Deletes a saved card from the vault and drops it from the list. */
  async function removeCard(id: string) {
    setRemovingId(id);
    setError(null);
    try {
      await removePaymentMethod(id);
      queryClient.setQueryData(listKey, (current: PaymentMethodList | undefined) =>
        current ? { ...current, data: current.data.filter((row) => row.id !== id) } : current,
      );
      void queryClient.invalidateQueries({ queryKey: listKey });
    } catch (err) {
      setError(isApiError(err) ? err.message : "No pudimos eliminar la tarjeta. Intenta de nuevo.");
    } finally {
      setRemovingId(null);
    }
  }

  return {
    /** False when there is no card to charge here: hide the step. */
    available: !paused && (saved.available || direct),
    loading: isGuest ? false : saved.loading,
    cards: saved.cards,
    needsIdNumber,
    /** Whether a new card can be typed on this deployment. */
    enrollmentEnabled: canEnterCard,
    /** Whether the buyer may keep the card. Never in direct mode. */
    canSaveCard: !direct,
    choice: effectiveChoice,
    setChoice: (next: CardChoice) => {
      setChoice(next);
      setError(null);
    },
    usingNewCard,
    /** True when tapping Pagar will charge a card here. */
    cardReady,
    draft,
    updateDraft,
    brand,
    errors,
    showErrors: touched,
    saveCard,
    setSaveCard,
    submitting,
    error,
    pay,
    settle,
    removeCard,
    /** Card being deleted right now, to disable its row. */
    removingId,
  };
}

export type CardCheckout = ReturnType<typeof useCardCheckout>;

function messageFor(err: unknown): string {
  if (isApiError(err)) {
    if (err.code === GUEST_CARD_PAUSED_CODE || err.code === "captcha_failed") {
      return err.message;
    }
    if (err.code === "card_declined") {
      return err.message || DECLINED_MESSAGE;
    }
    if (err.code === "card_declined_lockout") {
      return "Tu tarjeta fue rechazada varias veces. Espera unos minutos e intenta de nuevo.";
    }
    if (err.status === 429) {
      return "Demasiados intentos. Espera un momento e intenta de nuevo.";
    }
    return err.message;
  }
  if (err instanceof Error && err.message) return err.message;
  return "No pudimos procesar el pago. Intenta de nuevo.";
}
