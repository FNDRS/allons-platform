"use client";

import { useEffect } from "react";
import {
  takeBankHtml,
  threeDsFallbackReturnHref,
  writeBankDocument,
} from "@/lib/threeDs";

/**
 * Hands the tab to the bank: writes the HTML the checkout stashed for this
 * order over this page. Opened without one (a reload, a back step from the
 * bank), it goes to the order page, which reads the outcome from the API.
 */
export function ThreeDsVerify({ orderId }: { orderId: string }) {
  useEffect(() => {
    const html = takeBankHtml(orderId);
    if (!html) {
      window.location.replace(threeDsFallbackReturnHref(orderId));
      return;
    }
    writeBankDocument(html);
  }, [orderId]);

  return (
    <p className="p-6 text-center text-[14px] text-white/60">
      Abriendo la verificación de tu banco…
    </p>
  );
}
