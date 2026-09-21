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

const PLATE: Record<CardBrand, string> = {
  visa: "bg-white shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] ring-black/10",
  mastercard: "bg-white shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] ring-black/10",
  amex: "bg-[#016fd0] ring-white/12",
  diners: "bg-white shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] ring-black/10",
  discover: "bg-white shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] ring-black/10",
  unknown: "bg-white/6 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] ring-white/10",
};

const FRAMED_IMG: Record<CardBrand, string> = {
  visa: "h-[13px] w-[42px] object-contain",
  mastercard: "h-7 w-10 object-contain",
  amex: "absolute inset-0 size-full object-cover",
  diners: "h-7 w-7 object-cover object-left",
  discover: "h-[11px] w-[44px] object-contain",
  unknown: "h-5 w-5 object-contain",
};

/**
 * Card network marks from the real brand files in /public/brands.
 * Nothing is drawn by hand.
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
      className={`relative flex h-10 w-14 shrink-0 items-center justify-center overflow-hidden rounded-[9px] ring-1 ${PLATE[brand]}`}
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
