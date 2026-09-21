"use client";

import QRCode from "qrcode";
import { useEffect, useRef } from "react";

/** The QR on a white card: the one bright object on the page. */
export function TicketQr({ payload }: { payload: string }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!canvas.current || !payload) return;
    const node = canvas.current;
    void QRCode.toCanvas(node, payload, {
      width: 280,
      margin: 2,
      errorCorrectionLevel: "M",
      color: { dark: "#0a0a0a", light: "#ffffff" },
    }).then(() => {
      node.style.width = "100%";
      node.style.height = "auto";
    });
  }, [payload]);
  return (
    <div className="mx-auto w-full max-w-[min(100%,300px)] rounded-[32px] bg-[#111113] p-[6px] shadow-[0_28px_70px_rgba(0,0,0,0.55)] ring-1 ring-white/10">
      <div className="rounded-[26px] bg-white p-6 sm:p-7">
        <canvas
          ref={canvas}
          className="mx-auto block h-auto w-full"
          aria-label="Código QR del ticket"
        />
      </div>
    </div>
  );
}
