"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { usePaymentMethods } from "@/hooks/usePaymentMethods";
import { isApiError } from "@/lib/api/client";
import {
  enrollCard,
  paymentMethodKeys,
  removePaymentMethod,
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
export function useCardCheckout({ enabled }: { enabled: boolean }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const saved = usePaymentMethods(enabled);

  const [method, setMethod] = useState<PayMethod>("card");
  const [choice, setChoice] = useState<CardChoice>("new");
  const [draft, setDraft] = useState<CardDraft>(EMPTY_CARD_DRAFT);
  const [saveCard, setSaveCard] = useState(true);
  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Preselect the default card once the list lands, so a returning buyer
  // pays in one tap. Only runs while the buyer has not picked anything.
  const [autoPicked, setAutoPicked] = useState(false);
  useEffect(() => {
    if (autoPicked || !saved.available) return;
    const preferred = saved.cards.find((card) => card.isDefault) ?? saved.cards[0];
    if (preferred) setChoice(preferred.id);
    setAutoPicked(true);
  }, [autoPicked, saved.available, saved.cards]);

  const digits = digitsOnly(draft.number);
  const brand = detectBrand(digits);
  const errors = useMemo(
    () => validateCardDraft(draft, { needsIdNumber: saved.needsIdNumber }),
    [draft, saved.needsIdNumber],
  );
  const draftValid = Object.keys(errors).length === 0;
  const usingNewCard = choice === "new";

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
    if (usingNewCard && !draftValid) {
      setError("Revisa los datos de la tarjeta.");
      return;
    }
    setSubmitting(true);
    let enrolledId: string | null = null;
    try {
      let paymentMethodId = choice;
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
        void queryClient.invalidateQueries({ queryKey: paymentMethodKeys.list });
      }

      const result = await chargeWithSavedCard({ ...input, paymentMethodId });
      setDraft(EMPTY_CARD_DRAFT);
      if (result.status === "failed") {
        setError(DECLINED_MESSAGE);
        return;
      }
      router.replace(
        `/pagar/${encodeURIComponent(result.orderId)}?event=${encodeURIComponent(input.eventId)}`,
      );
    } catch (err) {
      setError(messageFor(err));
    } finally {
      // The buyer asked not to keep the card: drop it from the vault whether
      // the charge went through or not. Best effort; the list refetch shows
      // the truth if Paygate refuses.
      if (enrolledId && !saveCard) {
        await removePaymentMethod(enrolledId).catch(() => undefined);
        void queryClient.invalidateQueries({ queryKey: paymentMethodKeys.list });
      }
      setDraft((current) => ({ ...current, cvv: "" }));
      setSubmitting(false);
    }
  }

  return {
    /** False when this deployment has saved cards off: hide the step. */
    available: saved.available,
    loading: saved.loading,
    cards: saved.cards,
    needsIdNumber: saved.needsIdNumber,
    method,
    setMethod,
    choice,
    setChoice: (next: CardChoice) => {
      setChoice(next);
      setError(null);
    },
    usingNewCard,
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
