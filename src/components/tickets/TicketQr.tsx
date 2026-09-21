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
    <div className="mx-auto w-fit rounded-[24px] bg-white p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_40px_100px_rgba(0,0,0,0.6)]">
      <canvas ref={canvas} className="block size-[240px] sm:size-[280px]" aria-label="Código QR del ticket" />
    </div>
  );
}
