"use client";

import { motion, useReducedMotion } from "framer-motion";
import { AllonsLogo } from "@/components/AllonsLogo";

const COLUMN_COUNT = 5;
const COLUMNS = Array.from({ length: COLUMN_COUNT }, (_, i) => i);
const STEP_S = 0.08;
const DURATION_S = 0.55;
const TOTAL_S = DURATION_S + STEP_S * (COLUMN_COUNT - 1);
const EASE = [0.215, 0.61, 0.355, 1] as const;

/**
 * Stairs preloader: dark columns cover the page and, when unmounted inside
 * an `AnimatePresence`, slide up one after the other from left to right to
 * reveal what is underneath. Nothing animates on mount, so the cover is
 * already in place on the server-rendered HTML.
 */
export function StairsPreloader({ label = "Cargando" }: { label?: string }) {
  const reduced = useReducedMotion();
  const timing = (delay: number) =>
    reduced ? { duration: 0 } : { duration: DURATION_S, ease: EASE, delay };

  return (
    <motion.div
      role="status"
      aria-label={label}
      className="fixed inset-0 z-[60] flex"
      exit={{ opacity: 0 }}
      transition={
        reduced
          ? { duration: 0 }
          : { duration: 0.15, delay: TOTAL_S - 0.15 }
      }
    >
      {COLUMNS.map((i) => (
        <motion.div
          key={i}
          className="h-full flex-1 bg-[#050505]"
          exit={{ y: "-100%" }}
          transition={timing(i * STEP_S)}
        />
      ))}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
        exit={{ opacity: 0, y: -12 }}
        transition={reduced ? { duration: 0 } : { duration: 0.25, ease: EASE }}
      >
        <AllonsLogo className="h-7 w-auto sm:h-8" />
      </motion.div>
    </motion.div>
  );
}
