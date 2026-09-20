"use client";

import QRCode from "qrcode";
import { useEffect, useRef } from "react";

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
    <div className="mx-auto w-fit rounded-[28px] bg-white p-4 shadow-[0_30px_80px_rgba(0,0,0,0.5)]">
      <canvas ref={canvas} className="block size-[240px] sm:size-[280px]" aria-label="Código QR del ticket" />
    </div>
  );
}
