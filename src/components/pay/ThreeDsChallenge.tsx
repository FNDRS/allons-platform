"use client";

import { useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { THREE_DS_DONE_MESSAGE } from "@/lib/api/payments";

/**
 * The bank's verification over the checkout. Closes itself when the bank's
 * return page reports back; closing it by hand also ends the wait, and the
 * order page then shows what the bank decided.
 */
export function ThreeDsChallenge({
  orderId,
  onDone,
}: {
  orderId: string | null;
  onDone: () => void;
}) {
  useEffect(() => {
    if (!orderId) return;
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      const data = event.data as { type?: unknown; orderId?: unknown } | null;
      if (data?.type === THREE_DS_DONE_MESSAGE && data.orderId === orderId) onDone();
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [orderId, onDone]);

  return (
    <Modal open={Boolean(orderId)} onClose={onDone} title="Verifica tu pago">
      <p className="mb-3 text-[13px] leading-5 text-white/55">
        Tu banco pide confirmar esta compra. Sigue los pasos para terminar.
      </p>
      {orderId ? (
        <iframe
          title="Verificación de tu banco"
          src={`/pagar/${encodeURIComponent(orderId)}/verificar`}
          className="h-[520px] w-full rounded-[16px] border-0 bg-white"
        />
      ) : null}
    </Modal>
  );
}
