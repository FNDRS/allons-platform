"use client";

import { useEffect, useRef } from "react";
import { Modal } from "@/components/ui/Modal";
import type { ThreeDsChallengeState } from "@/hooks/useThreeDsChallenge";
import {
  isWithinFrame,
  readThreeDsMessage,
  THREE_DS_DONE,
  THREE_DS_HTML,
  THREE_DS_READY,
} from "@/lib/threeDs";

/**
 * The bank's verification over the checkout. Hands the bank's HTML to the
 * hosting page when it asks, and closes when the bank's return page reports
 * back from inside that frame. Closing it by hand also ends the wait; the
 * order page then shows what the bank decided.
 */
export function ThreeDsChallenge({
  challenge,
  onDone,
}: {
  challenge: ThreeDsChallengeState | null;
  onDone: () => void;
}) {
  const frame = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!challenge) return;
    const onMessage = (event: MessageEvent) => {
      const message = readThreeDsMessage(event.data);
      if (!message || message.orderId !== challenge.orderId) return;
      const host = frame.current?.contentWindow;
      if (
        message.type === THREE_DS_READY &&
        event.origin === window.location.origin &&
        host &&
        event.source === host
      ) {
        host.postMessage(
          { type: THREE_DS_HTML, orderId: challenge.orderId, html: challenge.html },
          window.location.origin,
        );
        return;
      }
      // Sent from the sandboxed frame, so its origin is opaque ("null").
      if (message.type === THREE_DS_DONE && isWithinFrame(event.source, host)) {
        onDone();
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [challenge, onDone]);

  return (
    <Modal open={Boolean(challenge)} onClose={onDone} title="Verifica tu pago">
      <p className="mb-3 text-[13px] leading-5 text-white/55">
        Tu banco pide confirmar esta compra. Sigue los pasos para terminar.
      </p>
      {challenge ? (
        <iframe
          ref={frame}
          title="Verificación de tu banco"
          src={`/pagar/${encodeURIComponent(challenge.orderId)}/verificar`}
          className="h-[520px] w-full rounded-[16px] border-0 bg-white"
        />
      ) : null}
    </Modal>
  );
}
