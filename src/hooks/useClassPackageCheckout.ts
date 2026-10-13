"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCardCheckout } from "@/hooks/useCardCheckout";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { isApiError } from "@/lib/api/client";
import {
  chargeClassPackage,
  classProgramKeys,
  getClassProgram,
  myClassKeys,
  startClassPackagePayment,
} from "@/lib/api/classPrograms";
import { paymentLinkStorageKey } from "@/lib/api/payments";

function payHref(orderId: string, link?: string) {
  const base = `/pagar/${encodeURIComponent(orderId)}`;
  return link ? `${base}?link=${encodeURIComponent(link)}` : base;
}

/**
 * Buying one paid class package. With a card in Allons (saved or new) the
 * charge settles here and the buyer lands on /pagar to see the outcome;
 * otherwise the hosted Paygate page opens from /pagar, which polls the order.
 */
export function useClassPackageCheckout(programId: string, packageId: string) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { ready, user } = useRequireAuth();
  const viewer = user?.id ?? null;

  const programQuery = useQuery({
    queryKey: classProgramKeys.detail(programId, viewer),
    queryFn: () => getClassProgram(programId, true),
    enabled: ready,
  });
  const program = programQuery.data ?? null;
  const item =
    program?.packages.find((pkg) => pkg.id === packageId && pkg.active) ?? null;
  const paid = Boolean(item && Number(item.price) > 0);

  const checkout = useCardCheckout({ userId: viewer, enabled: ready && paid });
  const payInApp = checkout.available && checkout.cardReady;

  const [startingHosted, setStartingHosted] = useState(false);
  const [hostedError, setHostedError] = useState<string | null>(null);

  const refreshAfterCharge = () => {
    void queryClient.invalidateQueries({ queryKey: myClassKeys.passes });
    void queryClient.invalidateQueries({ queryKey: classProgramKeys.program(programId) });
  };

  async function payHosted() {
    setHostedError(null);
    setStartingHosted(true);
    try {
      const order = await startClassPackagePayment(packageId);
      try {
        window.sessionStorage.setItem(paymentLinkStorageKey(order.orderId), order.paymentLink);
      } catch {
        /* the query param still carries it */
      }
      router.replace(payHref(order.orderId, order.paymentLink));
    } catch (err) {
      setHostedError(
        isApiError(err) ? err.message : "No se pudo iniciar el pago. Intenta de nuevo.",
      );
      setStartingHosted(false);
    }
  }

  function pay() {
    if (!item || !paid) return;
    if (!payInApp) {
      void payHosted();
      return;
    }
    void checkout.settle(async (paymentMethodId) => {
      const result = await chargeClassPackage(item.id, paymentMethodId);
      if (result.status === "paid") refreshAfterCharge();
      return result;
    }, (orderId) => payHref(orderId));
  }

  return {
    ready,
    program,
    item,
    paid,
    loading: !ready || programQuery.isLoading,
    error: (programQuery.error as Error | null) ?? null,
    refetch: () => void programQuery.refetch(),
    checkout,
    payInApp,
    submitting: checkout.submitting || startingHosted || checkout.loading,
    payError: checkout.error ?? hostedError,
    pay,
  };
}
