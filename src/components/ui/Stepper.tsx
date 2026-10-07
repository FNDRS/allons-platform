"use client";

import { Check } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

const EASE = [0.32, 0.72, 0, 1] as const;

/**
 * Progreso de un flujo por pasos: un punto por paso unidos por una línea que
 * se llena. Los pasos ya hechos se pueden tocar para volver a ellos.
 */
export function Stepper({
  steps,
  current,
  onSelect,
}: {
  steps: { id: string; label: string }[];
  current: number;
  /** Sólo se llama con pasos anteriores al actual. */
  onSelect?: (index: number) => void;
}) {
  const reduced = useReducedMotion();
  const progress = steps.length > 1 ? current / (steps.length - 1) : 1;

  return (
    <nav aria-label="Progreso">
      <p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.14em] text-muted sm:hidden">
        Paso {current + 1} de {steps.length}
        <span className="ml-2 normal-case tracking-normal text-white">{steps[current]?.label}</span>
      </p>
      <ol className="relative flex items-start justify-between">
        <span
          aria-hidden
          className="absolute left-4 right-4 top-4 h-px bg-border-strong"
        />
        <motion.span
          aria-hidden
          className="absolute left-4 top-4 h-px origin-left bg-accent"
          style={{ right: "1rem" }}
          initial={false}
          animate={{ scaleX: progress }}
          transition={reduced ? { duration: 0 } : { duration: 0.6, ease: EASE }}
        />
        {steps.map((step, index) => {
          const done = index < current;
          const active = index === current;
          const clickable = done && onSelect;
          return (
            <li key={step.id} className="relative z-10 flex flex-col items-center gap-2">
              <button
                type="button"
                disabled={!clickable}
                onClick={() => clickable && onSelect(index)}
                aria-current={active ? "step" : undefined}
                aria-label={`${step.label}${done ? ", listo" : ""}`}
                className={`flex size-8 items-center justify-center rounded-full text-[12px] font-bold tabular-nums transition duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                  done
                    ? "cursor-pointer bg-accent text-black hover:shadow-[0_0_0_4px_rgba(246,112,16,0.18)]"
                    : active
                      ? "bg-[#0c0c0e] text-white shadow-[0_0_0_1px_var(--color-accent),0_0_0_5px_rgba(246,112,16,0.16)]"
                      : "bg-[#0c0c0e] text-dim shadow-[0_0_0_1px_var(--color-border-strong)]"
                }`}
              >
                {done ? <Check className="size-4" strokeWidth={2.5} aria-hidden /> : index + 1}
              </button>
              <span
                className={`hidden text-[12px] font-semibold tracking-tight transition-colors sm:block ${
                  active ? "text-white" : done ? "text-white/70" : "text-dim"
                }`}
              >
                {step.label}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
