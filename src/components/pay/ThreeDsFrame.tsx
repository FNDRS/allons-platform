"use client";

import { useSyncExternalStore } from "react";
import { threeDsStorageKey } from "@/lib/api/payments";

function subscribeNoop() {
  return () => {};
}

function readWindow(orderId: string): string | null {
  try {
    return window.sessionStorage.getItem(threeDsStorageKey(orderId));
  } catch {
    return null;
  }
}

/**
 * The bank's 3DS window, as Clinpays sent it. It runs in a frame of its own
 * so its scripts and forms never share a document, or a CSP, with the card
 * form that framed this page.
 */
export function ThreeDsFrame({ orderId }: { orderId: string }) {
  const html = useSyncExternalStore(
    subscribeNoop,
    () => readWindow(orderId),
    () => null,
  );

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
      className="fixed inset-0 h-full w-full border-0 bg-white"
    />
  );
}
