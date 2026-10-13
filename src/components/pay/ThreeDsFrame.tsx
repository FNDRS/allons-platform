"use client";

import { useEffect, useState } from "react";
import {
  readThreeDsMessage,
  THREE_DS_HTML,
  THREE_DS_READY,
  THREE_DS_SANDBOX,
} from "@/lib/threeDs";

/**
 * Hosts the bank's 3DS window. The HTML comes from the checkout that framed
 * this page, never from storage or the URL, and runs in a sandboxed frame
 * with an opaque origin, so the bank's scripts reach neither this site's
 * pages nor its session.
 */
export function ThreeDsFrame({ orderId }: { orderId: string }) {
  const [html, setHtml] = useState<string | null>(null);
  const [framed, setFramed] = useState(true);

  useEffect(() => {
    if (window.parent === window) {
      setFramed(false);
      return;
    }
    const onMessage = (event: MessageEvent) => {
      if (event.source !== window.parent) return;
      if (event.origin !== window.location.origin) return;
      const message = readThreeDsMessage(event.data);
      if (message?.type === THREE_DS_HTML && message.orderId === orderId && message.html) {
        setHtml(message.html);
      }
    };
    window.addEventListener("message", onMessage);
    window.parent.postMessage({ type: THREE_DS_READY, orderId }, window.location.origin);
    return () => window.removeEventListener("message", onMessage);
  }, [orderId]);

  if (!framed) {
    return (
      <p className="p-6 text-center text-[14px] text-white/60">
        Esta verificación se abre desde el pago. Vuelve al evento para intentarlo.
      </p>
    );
  }
  if (!html) {
    return (
      <p className="p-6 text-center text-[14px] text-white/60">
        Cargando la verificación de tu banco…
      </p>
    );
  }
  return (
    <iframe
      title="Verificación de tu banco"
      srcDoc={html}
      sandbox={THREE_DS_SANDBOX}
      className="fixed inset-0 h-full w-full border-0 bg-white"
    />
  );
}
