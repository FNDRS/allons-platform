import { CreditCard } from "lucide-react";
import type { CardBrand } from "@/lib/cards";

/**
 * Network marks drawn inline so nothing is fetched from a third party on
 * the payment step. Kept schematic on purpose: shape and colour are what
 * the eye checks against the plastic in hand.
 */
export function CardBrandMark({
  brand,
  className = "h-6",
}: {
  brand: CardBrand;
  className?: string;
}) {
  switch (brand) {
    case "visa":
      return (
        <svg viewBox="0 0 48 16" className={className} aria-label="Visa" role="img">
          <text
            x="0"
            y="14"
            fontFamily="Urbanist, ui-sans-serif, system-ui"
            fontWeight="800"
            fontStyle="italic"
            fontSize="17"
            letterSpacing="-0.5"
            fill="#ffffff"
          >
            VISA
          </text>
        </svg>
      );
    case "mastercard":
      return (
        <svg viewBox="0 0 38 24" className={className} aria-label="Mastercard" role="img">
          <circle cx="13" cy="12" r="11" fill="#eb001b" />
          <circle cx="25" cy="12" r="11" fill="#f79e1b" fillOpacity="0.95" />
          <path d="M19 3.4a11 11 0 0 1 0 17.2 11 11 0 0 1 0-17.2z" fill="#ff5f00" />
        </svg>
      );
    case "amex":
      return (
        <svg viewBox="0 0 48 16" className={className} aria-label="American Express" role="img">
          <rect width="48" height="16" rx="3" fill="#2e77bc" />
          <text
            x="24"
            y="11.5"
            textAnchor="middle"
            fontFamily="Urbanist, ui-sans-serif, system-ui"
            fontWeight="800"
            fontSize="9"
            letterSpacing="0.6"
            fill="#ffffff"
          >
            AMEX
          </text>
        </svg>
      );
    case "diners":
      return (
        <svg viewBox="0 0 24 24" className={className} aria-label="Diners Club" role="img">
          <circle cx="12" cy="12" r="11" fill="#0079be" />
          <circle cx="12" cy="12" r="6.5" fill="none" stroke="#fff" strokeWidth="2" />
        </svg>
      );
    case "discover":
      return (
        <svg viewBox="0 0 24 24" className={className} aria-label="Discover" role="img">
          <circle cx="12" cy="12" r="11" fill="#ff6000" />
        </svg>
      );
    default:
      return <CreditCard className={`${className} w-auto text-white/60`} strokeWidth={1.6} aria-hidden />;
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
