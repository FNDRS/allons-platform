"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

export function TicketCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked: the code is still visible */
    }
  }
  return (
    <div className="flex flex-col items-center gap-1.5">
      <p className="text-[12px] font-semibold uppercase tracking-[0.25em] text-white/45">
        Código de acceso
      </p>
      <button
        type="button"
        onClick={() => void copy()}
        className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.05] px-5 py-3 font-mono text-2xl font-bold tracking-[0.18em] hover:bg-white/[0.09]"
        aria-label={`Copiar código ${code}`}
      >
        {code}
        {copied ? (
          <Check className="size-4 text-emerald-300" aria-hidden />
        ) : (
          <Copy className="size-4 text-white/40" aria-hidden />
        )}
      </button>
      <p className="text-xs text-white/40">Si el QR no lee, dicta este código en la entrada.</p>
    </div>
  );
}
