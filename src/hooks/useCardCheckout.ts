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
  chargeWithSavedCard,
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

export type PayMethod = "card" | "paygate";
/** A saved card id, or "new" for the form. */
export type CardChoice = string;

const DECLINED_MESSAGE =
  "Tu banco rechazó la tarjeta. Prueba con otra o paga en Paygate.";

/**
 * Everything behind the "Pago" step: which method, which card, the new-card
 * draft, and the settle flow (vault the card, charge it, hand off to /pagar).
 * Card data lives only in React state and is wiped after every attempt.
 */
export function useCardCheckout({
  userId,
  enabled,
}: {
  userId: string | null;
  enabled: boolean;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const saved = usePaymentMethods({ userId, enabled });
  const listKey = paymentMethodKeys.list(userId ?? "");

  const [method, setMethod] = useState<PayMethod>("card");
  const [choice, setChoice] = useState<CardChoice>("new");
  const [draft, setDraft] = useState<CardDraft>(EMPTY_CARD_DRAFT);
  // Opt in, never opt out: a card is kept only when the buyer asks.
  const [saveCard, setSaveCard] = useState(false);
  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Preselect the default card once the list lands, so a returning buyer
  // pays in one tap. Only runs while the buyer has not picked anything.
  // With no cards and enrollment closed, the hosted page is the only way.
  const [autoPicked, setAutoPicked] = useState(false);
  useEffect(() => {
    if (autoPicked || !saved.available) return;
    const preferred = saved.cards.find((card) => card.isDefault) ?? saved.cards[0];
    if (preferred) setChoice(preferred.id);
    else if (!saved.enrollmentEnabled) setMethod("paygate");
    setAutoPicked(true);
  }, [autoPicked, saved.available, saved.cards, saved.enrollmentEnabled]);

  // The list can lose the chosen card under us (removed from the app or
  // another tab): fall back rather than posting an id the API will 404.
  const effectiveChoice: CardChoice = useMemo(() => {
    if (choice === "new") return saved.enrollmentEnabled ? "new" : "";
    if (saved.cards.some((card) => card.id === choice)) return choice;
    const fallback = saved.cards.find((card) => card.isDefault) ?? saved.cards[0];
    if (fallback) return fallback.id;
    return saved.enrollmentEnabled ? "new" : "";
  }, [choice, saved.cards, saved.enrollmentEnabled]);

  const digits = digitsOnly(draft.number);
  const brand = detectBrand(digits);
  const errors = useMemo(
    () => validateCardDraft(draft, { needsIdNumber: saved.needsIdNumber }),
    [draft, saved.needsIdNumber],
  );
  const draftValid = Object.keys(errors).length === 0;
  const usingNewCard = effectiveChoice === "new";
  /** A card (saved or new) is selected and can actually be charged. */
  const cardReady = method === "card" && effectiveChoice !== "";

  function updateDraft(patch: Partial<CardDraft>) {
    setDraft((current) => ({ ...current, ...patch }));
    if (error) setError(null);
  }

  /**
   * Settles the order with the chosen card. Returns once the buyer has been
   * sent to /pagar or an error is showing.
   */
  async function pay(input: InitiatePaymentInput) {
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
    try {
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
          ...(saved.needsIdNumber ? { idNumber: draft.idNumber.trim() } : {}),
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

      const result = await chargeWithSavedCard({ ...input, paymentMethodId });
      if (result.status === "failed") {
        setError(DECLINED_MESSAGE);
        return;
      }
      paidOrderId = result.orderId;
    } catch (err) {
      setError(messageFor(err));
    } finally {
      // The buyer did not ask to keep the card: drop it from the vault
      // whether the charge went through or not, before leaving the page.
      // One retry, then the buyer is told so the card does not linger as
      // a silent one-tap option.
      if (enrolledId && !saveCard) {
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
      if (enrolledId) {
        void queryClient.invalidateQueries({ queryKey: listKey });
      }
      // Only a completed payment wipes the form; a decline or an error
      // keeps everything but the CVV so the buyer can fix one field.
      setDraft(
        paidOrderId ? EMPTY_CARD_DRAFT : (current) => ({ ...current, cvv: "" }),
      );
      setSubmitting(false);
    }
    if (paidOrderId) {
      router.replace(
        `/pagar/${encodeURIComponent(paidOrderId)}?event=${encodeURIComponent(input.eventId)}`,
      );
    }
  }

  return {
    /** False when this deployment has saved cards off: hide the step. */
    available: saved.available,
    loading: saved.loading,
    cards: saved.cards,
    needsIdNumber: saved.needsIdNumber,
    /** Whether a new card can be added on this deployment. */
    enrollmentEnabled: saved.enrollmentEnabled,
    method,
    setMethod,
    choice: effectiveChoice,
    setChoice: (next: CardChoice) => {
      setChoice(next);
      setError(null);
    },
    usingNewCard,
    /** True when tapping Pagar will charge a card here instead of opening Paygate. */
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
  };
}

export type CardCheckout = ReturnType<typeof useCardCheckout>;

function messageFor(err: unknown): string {
  if (isApiError(err)) {
    if (err.code === "card_declined_lockout") {
      return "Tu tarjeta fue rechazada varias veces. Espera unos minutos o paga en Paygate.";
    }
    if (err.status === 429) {
      return "Demasiados intentos. Espera un momento e intenta de nuevo.";
    }
    return err.message;
  }
  return "No pudimos procesar el pago. Intenta de nuevo.";
}
