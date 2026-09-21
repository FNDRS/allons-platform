"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, Copy } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const SPRING = { type: "spring", stiffness: 500, damping: 28, mass: 0.6 } as const;
const COPIED_MS = 1600;

export function TicketCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const reset = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reduced = useReducedMotion();

  useEffect(
    () => () => {
      if (reset.current) clearTimeout(reset.current);
    },
    [],
  );

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      if (reset.current) clearTimeout(reset.current);
      reset.current = setTimeout(() => setCopied(false), COPIED_MS);
    } catch {
      /* clipboard blocked: the code is still visible */
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-muted">Código de acceso</p>
      <motion.button
        type="button"
        onClick={() => void copy()}
        whileTap={reduced ? undefined : { scale: 0.97 }}
        animate={
          copied
            ? { borderColor: "rgba(52, 211, 153, 0.55)", backgroundColor: "rgba(52, 211, 153, 0.10)" }
            : { borderColor: "rgba(255, 255, 255, 0.08)", backgroundColor: "rgba(255, 255, 255, 0.06)" }
        }
        transition={reduced ? { duration: 0 } : { duration: 0.3, ease: "easeOut" }}
        className="flex h-14 items-center gap-3 rounded-full border pl-6 pr-3 text-[26px] font-bold tracking-[0.12em] hover:border-border-strong"
        aria-label={copied ? "Código copiado" : `Copiar código ${code}`}
        aria-live="polite"
      >
        <span className="tabular-nums">{code}</span>
        <motion.span
          className="flex size-9 items-center justify-center rounded-full bg-white/[0.08]"
          animate={copied ? { backgroundColor: "rgba(52, 211, 153, 0.18)" } : { backgroundColor: "rgba(255, 255, 255, 0.08)" }}
          transition={reduced ? { duration: 0 } : { duration: 0.3 }}
        >
          <AnimatePresence mode="wait" initial={false}>
            {copied ? (
              <motion.span
                key="check"
                initial={reduced ? false : { scale: 0.4, rotate: -45, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                exit={reduced ? undefined : { scale: 0.4, opacity: 0 }}
                transition={reduced ? { duration: 0 } : SPRING}
                className="flex"
              >
                <Check className="size-4 text-success" strokeWidth={3} aria-hidden />
              </motion.span>
            ) : (
              <motion.span
                key="copy"
                initial={reduced ? false : { scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={reduced ? undefined : { scale: 0.6, opacity: 0 }}
                transition={reduced ? { duration: 0 } : { duration: 0.15 }}
                className="flex"
              >
                <Copy className="size-4 text-muted" aria-hidden />
              </motion.span>
            )}
          </AnimatePresence>
        </motion.span>
      </motion.button>
      <p className="text-[13px] text-white/38">
        Si el QR no lee, dicta este código en la entrada.
      </p>
    </div>
  );
}
