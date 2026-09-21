/* eslint-disable @next/next/no-img-element */

import { CreditCard } from "lucide-react";
import type { CardBrand } from "@/lib/cards";

const SRC: Partial<Record<CardBrand, string>> = {
  visa: "/brands/visa.png",
  mastercard: "/brands/mastercard.png",
  amex: "/brands/amex.png",
  diners: "/brands/diners.png",
  discover: "/brands/discover.png",
};

const WHITE_PLATE =
  "bg-white shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] ring-black/10";

const PLATE: Record<CardBrand, string> = {
  visa: `h-8 w-[3.6rem] ${WHITE_PLATE}`,
  mastercard: `h-10 w-14 ${WHITE_PLATE}`,
  amex: "h-10 w-14 bg-transparent ring-black/10",
  diners: `h-8 w-[3.6rem] ${WHITE_PLATE}`,
  discover: `h-8 w-[3.6rem] ${WHITE_PLATE}`,
  unknown: "h-10 w-14 bg-white/6 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] ring-white/10",
};

const FRAMED_IMG: Record<CardBrand, string> = {
  visa: "h-[22px] w-[50px] object-contain",
  mastercard: "h-[22px] w-9 object-contain",
  amex: "absolute inset-0 size-full object-cover",
  diners: "h-[18px] w-[48px] object-contain",
  discover: "h-[14px] w-[48px] object-contain",
  unknown: "h-5 w-5 object-contain",
};

/**
 * Real brand artwork from /public/brands. Same white plate for every
 * network; Amex fills the chip because that mark is already a square.
 */
export function CardBrandMark({
  brand,
  className = "h-6",
  framed = false,
}: {
  brand: CardBrand;
  className?: string;
  framed?: boolean;
}) {
  const src = SRC[brand];
  const mark = src ? (
    <img
      src={src}
      alt=""
      className={framed ? FRAMED_IMG[brand] : `object-contain ${className}`}
    />
  ) : (
    <CreditCard className={`${className} w-auto text-white/55`} strokeWidth={1.5} aria-hidden />
  );

  if (!framed) return mark;
  return (
    <span
      className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-[9px] ring-1 ${PLATE[brand]}`}
      aria-label={brand === "unknown" ? undefined : brand}
      role="img"
    >
      {mark}
    </span>
  );
}

/** Maps Paygate's brand string ("VISA", "MASTERCARD") onto our enum. */
export function brandFromLabel(label: string | null | undefined): CardBrand {
  const key = (label ?? "").toLowerCase();
  if (key.includes("visa")) return "visa";
  if (key.includes("master")) return "mastercard";
  if (key.includes("amex") || key.includes("american")) return "amex";
  if (key.includes("diners")) return "diners";
  if (key.includes("discover")) return "discover";
  return "unknown";
}
