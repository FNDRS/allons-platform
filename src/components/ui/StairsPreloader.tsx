"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { AllonsLogo } from "@/components/AllonsLogo";

const COLUMN_COUNT = 5;
const COLUMNS = Array.from({ length: COLUMN_COUNT }, (_, i) => i);
const STEP_S = 0.08;
const DURATION_S = 0.55;
const TOTAL_S = DURATION_S + STEP_S * (COLUMN_COUNT - 1);
const EASE = [0.215, 0.61, 0.355, 1] as const;

/**
 * White stairs over the full viewport. Must render as a sibling of the
 * shell (not inside main) so the nav never paints on top of it.
 */
export function StairsPreloader({
  show,
  label = "Cargando",
}: {
  show: boolean;
  label?: string;
}) {
  const reduced = useReducedMotion();
  return (
    <AnimatePresence>
      {show ? (
        <motion.div
          key="stairs"
          role="status"
          aria-label={label}
          className="fixed inset-0 z-[200] flex overflow-hidden"
          initial={false}
          exit={reduced ? { opacity: 0 } : { opacity: 1 }}
          transition={
            reduced
              ? { duration: 0.15 }
              : { duration: TOTAL_S, ease: "linear" }
          }
        >
          {COLUMNS.map((i) => (
            <motion.div
              key={i}
              className="h-full min-w-0 flex-1 bg-[#ffffff]"
              exit={reduced ? { opacity: 0 } : { y: "-101%" }}
              transition={
                reduced
                  ? { duration: 0 }
                  : { duration: DURATION_S, ease: EASE, delay: i * STEP_S }
              }
            />
          ))}
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0 flex items-center justify-center"
            exit={{ opacity: 0, y: -12 }}
            transition={
              reduced ? { duration: 0 } : { duration: 0.28, ease: EASE }
            }
          >
            <AllonsLogo className="h-3.5 w-auto sm:h-4" variant="black" />
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
