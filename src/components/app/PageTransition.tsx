"use client";

import { motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";

const EASE = [0.32, 0.72, 0, 1] as const;

/**
 * Fade and rise when the route changes. Lives inside the page body so the
 * nav and tabs stay put.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const reduced = useReducedMotion();
  return (
    <motion.div
      key={pathname}
      initial={reduced ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduced ? 0 : 0.48, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}
