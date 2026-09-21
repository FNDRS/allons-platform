"use client";

import QRCode from "qrcode";
import { useEffect, useRef } from "react";

/** The QR on a white card: the one bright object on the page. */
export function TicketQr({ payload }: { payload: string }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!canvas.current || !payload) return;
    void QRCode.toCanvas(canvas.current, payload, {
      width: 280,
      margin: 1,
      errorCorrectionLevel: "M",
      color: { dark: "#0a0a0a", light: "#ffffff" },
    });
  }, [payload]);
  return (
    <div className="mx-auto w-full max-w-[min(100%,292px)] rounded-[32px] bg-[#111113] p-[6px] shadow-[0_28px_70px_rgba(0,0,0,0.55)] ring-1 ring-white/10">
      <div className="overflow-hidden rounded-[26px] bg-white p-4 sm:p-5">
        <canvas
          ref={canvas}
          className="block h-auto w-full"
          aria-label="Código QR del ticket"
        />
      </div>
    </div>
  );
}
