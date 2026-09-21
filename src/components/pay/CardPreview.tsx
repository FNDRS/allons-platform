"use client";

import { motion, useReducedMotion } from "framer-motion";
import { BRAND_LABEL, cvvLength, formatCardNumber, type CardBrand } from "@/lib/cards";
import { CardBrandMark } from "./CardBrandMark";

const SURFACE: Record<CardBrand, string> = {
  visa: "from-[#1a2a6c] via-[#141b3d] to-[#0b0e1f]",
  mastercard: "from-[#2b1a12] via-[#17110d] to-[#0a0808]",
  amex: "from-[#0f3d4a] via-[#0b2a33] to-[#07161b]",
  diners: "from-[#0c2f4a] via-[#0a2036] to-[#06121e]",
  discover: "from-[#4a2205] via-[#2c1504] to-[#140a02]",
  unknown: "from-[#2a2a2e] via-[#17171a] to-[#0a0a0b]",
};

/**
 * Live rendering of the card being typed. Flips to the back while the CVV
 * field has focus, the way the buyer flips the physical card.
 */
export function CardPreview({
  digits,
  name,
  expiry,
  cvv,
  brand,
  flipped,
}: {
  digits: string;
  name: string;
  expiry: string;
  cvv: string;
  brand: CardBrand;
  flipped: boolean;
}) {
  const reduce = useReducedMotion();
  const shown = formatCardNumber(digits, brand);
  const placeholder = brand === "amex" ? "•••• •••••• •••••" : "•••• •••• •••• ••••";
  const number = shown.length
    ? shown + placeholder.slice(shown.length)
    : placeholder;

  return (
    <div className="mx-auto w-full max-w-[340px] [perspective:1200px]">
      <motion.div
        className="relative aspect-[1.586] w-full [transform-style:preserve-3d]"
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={
          reduce ? { duration: 0 } : { type: "spring", stiffness: 260, damping: 26 }
        }
      >
        <Face brand={brand} className="[backface-visibility:hidden]">
          <div className="flex items-start justify-between">
            <Chip />
            <CardBrandMark brand={brand} framed />
          </div>
          <p className="mt-auto font-mono text-[19px] font-semibold tabular-nums tracking-[0.12em] text-white/95 sm:text-[21px]">
            {number}
          </p>
          <div className="mt-4 flex items-end justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[9px] font-medium uppercase tracking-[0.22em] text-white/40">
                Titular
              </p>
              <p className="truncate text-[13px] font-semibold uppercase tracking-[0.06em] text-white/90">
                {name.trim() || "NOMBRE APELLIDO"}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-[9px] font-medium uppercase tracking-[0.22em] text-white/40">
                Vence
              </p>
              <p className="font-mono text-[13px] font-semibold tabular-nums text-white/90">
                {expiry || "MM/AA"}
              </p>
            </div>
          </div>
        </Face>

        <Face
          brand={brand}
          className="[backface-visibility:hidden] [transform:rotateY(180deg)]"
        >
          <div className="-mx-6 mt-4 h-10 bg-black/70" />
          <div className="mt-5 flex items-center justify-end gap-3">
            <span className="text-[9px] font-medium uppercase tracking-[0.22em] text-white/40">
              CVV
            </span>
            <span className="flex h-9 min-w-[64px] items-center justify-end rounded-md bg-white/90 px-3 font-mono text-[14px] font-semibold tabular-nums tracking-[0.3em] text-black">
              {cvv ? "•".repeat(cvv.length) : "•".repeat(cvvLength(brand))}
            </span>
          </div>
          <p className="mt-auto text-[10px] text-white/35">{BRAND_LABEL[brand]}</p>
        </Face>
      </motion.div>
    </div>
  );
}

function Face({
  brand,
  className,
  children,
}: {
  brand: CardBrand;
  className: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`absolute inset-0 flex flex-col overflow-hidden rounded-[22px] bg-gradient-to-br p-6 shadow-[0_30px_80px_rgba(0,0,0,0.55)] ring-1 ring-white/12 ${SURFACE[brand]} ${className}`}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-1/4 -top-1/2 size-[140%] rounded-full bg-[radial-gradient(closest-side,rgba(255,255,255,0.14),transparent)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-1/2 -left-1/4 size-[120%] rounded-full bg-[radial-gradient(closest-side,rgba(246,112,16,0.16),transparent)]"
      />
      <div className="relative flex flex-1 flex-col">{children}</div>
    </div>
  );
}

function Chip() {
  return (
    <svg viewBox="0 0 34 26" className="h-7 w-auto" aria-hidden>
      <rect x="0.5" y="0.5" width="33" height="25" rx="5" fill="#d8b56a" stroke="#f1d99a" />
      <path
        d="M0.5 9h10a3 3 0 0 1 3 3v2a3 3 0 0 1-3 3h-10M33.5 9h-10a3 3 0 0 0-3 3v2a3 3 0 0 0 3 3h10M13.5 0.5v25M20.5 0.5v25"
        fill="none"
        stroke="#8a6a25"
        strokeWidth="0.9"
      />
    </svg>
  );
}
