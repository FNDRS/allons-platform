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
    <div className="flex flex-col items-center gap-2">
      <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-muted">Código de acceso</p>
      <button
        type="button"
        onClick={() => void copy()}
        className="flex h-14 items-center gap-3 rounded-full border border-border bg-surface-2 pl-6 pr-3 text-[26px] font-bold tracking-[0.12em] transition hover:border-border-strong hover:bg-white/[0.09]"
        aria-label={`Copiar código ${code}`}
      >
        <span className="tabular-nums">{code}</span>
        <span className="flex size-9 items-center justify-center rounded-full bg-white/[0.08]">
          {copied ? (
            <Check className="size-4 text-success" aria-hidden />
          ) : (
            <Copy className="size-4 text-muted" aria-hidden />
          )}
        </span>
      </button>
      <p className="text-[13px] text-dim">Si el QR no lee, dicta este código en la entrada.</p>
    </div>
  );
}
