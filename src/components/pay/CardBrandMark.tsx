import { CreditCard } from "lucide-react";
import type { CardBrand } from "@/lib/cards";

const PLATE: Record<CardBrand, string> = {
  visa: "bg-[#1a1f71]",
  mastercard: "bg-[#141416]",
  amex: "bg-[#006fcf]",
  diners: "bg-[#0079be]",
  discover: "bg-[#ff6000]",
  unknown: "bg-white/[0.06]",
};

/**
 * Network marks drawn inline so nothing is fetched on the payment step.
 * Visa is the flag wordmark; the rest keep their usual colour language.
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
  const mark = (
    <BrandGlyph
      brand={brand}
      className={framed ? "h-[15px] w-9" : className}
    />
  );
  if (!framed) return mark;
  return (
    <span
      className={`relative flex h-10 w-14 shrink-0 items-center justify-center overflow-hidden rounded-[9px] shadow-[inset_0_1px_0_rgba(255,255,255,0.22)] ring-1 ring-white/12 ${PLATE[brand]}`}
    >
      {mark}
    </span>
  );
}

function BrandGlyph({
  brand,
  className,
}: {
  brand: CardBrand;
  className: string;
}) {
  switch (brand) {
    case "visa":
      return (
        <svg viewBox="0 8 24 7" className={className} aria-label="Visa" role="img">
          <path
            fill="#ffffff"
            d="M16.539 9.186a4.226 4.226 0 0 0-1.472-.248c-1.618 0-2.75.908-2.76 2.209-.01 1.024.95 1.593 1.674 1.934.74.349 1.01.574.996.89-.01.48-.582.694-1.12.694-.745 0-1.14-.106-1.748-.366l-.24-.11-.329 1.911c.549.25 1.565.467 2.616.479 1.747 0 2.888-.864 2.9-2.203.012-.734-.462-1.294-1.476-1.754-.615-.298-1.044-.496-1.044-.798.004-.274.335-.555.847-.555a2.68 2.68 0 0 1 1.108.208l.133.063.32-1.873zm5.461-1.003h-1.35c-.42 0-.735.115-.917.535l-2.598 6.187h1.833l.366-1.006h2.24l.222 1.006h1.617l-1.413-6.722zm-1.617 4.378.73-1.99.422 1.99h-1.152zm-10.571-4.378-1.448 6.722h1.747l1.448-6.722H9.812zm-4.494 4.407c.192-.49.74-1.29.74-1.29s-.172.09-.446.247l.04-.18L6.37 8.183a1.126 1.126 0 0 0-1.215-.008L.002 14.183h1.883l.66-1.76h2.27l.36 1.76h2.06L5.318 8.183zm.26 2.028H3.76l.76-2.07.058-.153s.226.594.541 1.416c0 0 .192.507.219.807z"
          />
        </svg>
      );
    case "mastercard":
      return (
        <svg viewBox="0 0 38 24" className={className} aria-label="Mastercard" role="img">
          <circle cx="13" cy="12" r="11" fill="#eb001b" />
          <circle cx="25" cy="12" r="11" fill="#f79e1b" />
          <path d="M19 3.4a11 11 0 0 1 0 17.2 11 11 0 0 1 0-17.2z" fill="#ff5f00" />
        </svg>
      );
    case "amex":
      return (
        <svg viewBox="0 0 48 16" className={className} aria-label="American Express" role="img">
          <text
            x="24"
            y="12"
            textAnchor="middle"
            fontFamily="Urbanist, ui-sans-serif, system-ui"
            fontWeight="800"
            fontSize="9"
            letterSpacing="1.2"
            fill="#ffffff"
          >
            AMEX
          </text>
        </svg>
      );
    case "diners":
      return (
        <svg viewBox="0 0 24 24" className={className} aria-label="Diners Club" role="img">
          <circle cx="12" cy="12" r="8" fill="none" stroke="#fff" strokeWidth="2" />
          <path d="M8 12a4 8 0 0 1 8 0 4 8 0 0 1-8 0z" fill="#fff" />
        </svg>
      );
    case "discover":
      return (
        <svg viewBox="0 0 24 16" className={className} aria-label="Discover" role="img">
          <circle cx="18" cy="8" r="6" fill="#fff" fillOpacity="0.92" />
        </svg>
      );
    default:
      return <CreditCard className={`${className} w-auto text-white/55`} strokeWidth={1.5} aria-hidden />;
  }
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
