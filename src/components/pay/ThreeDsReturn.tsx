"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { THREE_DS_DONE_MESSAGE } from "@/lib/api/payments";

/**
 * Where the bank's window lands when it closes. It decides nothing: framed
 * by the checkout it tells that page to read the order, and opened on its
 * own it goes to the order page, which reads it.
 */
export function ThreeDsReturn({ orderId }: { orderId: string }) {
  const router = useRouter();

  useEffect(() => {
    if (window.top && window.top !== window.self) {
      window.top.postMessage(
        { type: THREE_DS_DONE_MESSAGE, orderId },
        window.location.origin,
      );
      return;
    }
    router.replace(`/pagar/${encodeURIComponent(orderId)}`);
  }, [orderId, router]);

  return (
    <p className="p-6 text-center text-[14px] text-white/60">
      Confirmando tu pago…
    </p>
  );
}
