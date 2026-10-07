"use client";

import { useEffect } from "react";
import confetti from "canvas-confetti";
import { motion, useReducedMotion } from "framer-motion";
import { Check, Inbox, RotateCw } from "lucide-react";
import { buttonClass } from "@/components/ui/Button";

const EASE = [0.32, 0.72, 0, 1] as const;

const NEXT_STEPS = [
  "Revisamos tu información, normalmente el mismo día.",
  "Te llega un correo para crear tu acceso al panel de comercio.",
  "Dejamos tu evento listo para publicar y lo revisamos contigo.",
];

/**
 * Las pantallas finales del registro: enviado (con confeti), un enlace que
 * ya se usó, y la API sin responder.
 */
export function OnboardingOutcome({
  kind,
  email,
}: {
  kind: "sent" | "used" | "unavailable";
  email?: string | null;
}) {
  const reduced = useReducedMotion();

  useEffect(() => {
    if (kind !== "sent" || reduced) return;
    confetti({
      particleCount: 90,
      spread: 80,
      startVelocity: 34,
      origin: { x: 0.5, y: 0.35 },
      ticks: 220,
      colors: ["#f67010", "#ffffff", "#ffb27a"],
    });
  }, [kind, reduced]);

  const Icon = kind === "sent" ? Check : kind === "used" ? Inbox : RotateCw;
  const title =
    kind === "sent"
      ? "¡Listo, ya lo tenemos!"
      : kind === "used"
        ? "Ya recibimos tu información"
        : "No pudimos cargar el registro";
  const body =
    kind === "sent"
      ? `Gracias. Te escribimos${email ? ` a ${email}` : ""} en cuanto tu perfil esté armado.`
      : kind === "used"
        ? "Este enlace ya se usó para enviar los datos. Si necesitas cambiar algo, escríbele a quien te lo mandó."
        : "Allons no respondió. Revisa tu conexión e intenta de nuevo en un momento.";

  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="flex flex-col items-center pt-6 text-center sm:pt-12"
    >
      <motion.span
        initial={reduced ? false : { scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: EASE, delay: 0.1 }}
        className={`flex size-20 items-center justify-center rounded-full ${
          kind === "sent"
            ? "bg-accent text-black shadow-[0_0_0_10px_rgba(246,112,16,0.14),0_20px_60px_rgba(246,112,16,0.35)]"
            : "border border-border-strong bg-surface-2 text-white"
        }`}
      >
        <Icon className="size-9" strokeWidth={kind === "sent" ? 2.75 : 1.75} aria-hidden />
      </motion.span>
      <h1 className="mt-7 text-[28px] font-bold leading-tight tracking-tight sm:text-[34px]">{title}</h1>
      <p className="mt-3 max-w-md text-[15px] leading-relaxed text-muted">{body}</p>

      {kind === "sent" ? (
        <ol className="mt-10 grid w-full max-w-md gap-3 text-left">
          {NEXT_STEPS.map((step, index) => (
            <motion.li
              key={step}
              initial={reduced ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: EASE, delay: 0.35 + index * 0.08 }}
              className="flex items-start gap-3 rounded-[16px] border border-border bg-surface p-4"
            >
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-accent-soft text-[12px] font-bold tabular-nums text-accent">
                {index + 1}
              </span>
              <span className="pt-0.5 text-[14px] leading-relaxed text-white/85">{step}</span>
            </motion.li>
          ))}
        </ol>
      ) : null}

      {kind === "unavailable" ? (
        // Un enlace normal, no un botón con JS: recarga la página entera.
        <a href="" className={buttonClass({ variant: "primary", size: "md", className: "mt-8" })}>
          Intentar de nuevo
        </a>
      ) : null}
    </motion.div>
  );
}
