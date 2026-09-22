/**
 * Pure helpers for the card form. Everything here runs on the buyer's own
 * device against what they are typing; nothing is stored and nothing is
 * sent until they pay.
 */

export type CardBrand =
  | "visa"
  | "mastercard"
  | "amex"
  | "diners"
  | "discover"
  | "unknown";

export const BRAND_LABEL: Record<CardBrand, string> = {
  visa: "Visa",
  mastercard: "Mastercard",
  amex: "American Express",
  diners: "Diners Club",
  discover: "Discover",
  unknown: "Tarjeta",
};

export function digitsOnly(value: string): string {
  return value.replace(/\D+/g, "");
}

export function detectBrand(digits: string): CardBrand {
  if (/^4/.test(digits)) return "visa";
  if (/^(5[1-5]|2[2-7])/.test(digits)) return "mastercard";
  if (/^3[47]/.test(digits)) return "amex";
  if (/^3(0[0-5]|[689])/.test(digits)) return "diners";
  if (/^6(011|5|4[4-9])/.test(digits)) return "discover";
  return "unknown";
}

export function maxDigits(brand: CardBrand): number {
  if (brand === "amex") return 15;
  if (brand === "diners") return 14;
  return 16;
}

/** Character cap of the formatted value, spaces included. */
export function formattedNumberMaxLength(brand: CardBrand): number {
  if (brand === "amex") return 17;
  if (brand === "diners") return 17;
  return 19;
}

export function cvvLength(brand: CardBrand): number {
  return brand === "amex" ? 4 : 3;
}

/** 4-6-5 for Amex, groups of four for everyone else. */
export function formatCardNumber(digits: string, brand: CardBrand): string {
  if (brand === "amex") {
    return [digits.slice(0, 4), digits.slice(4, 10), digits.slice(10, 15)]
      .filter(Boolean)
      .join(" ");
  }
  return digits.replace(/(.{4})/g, "$1 ").trim();
}

export function passesLuhn(digits: string): boolean {
  if (!/^\d{13,19}$/.test(digits)) return false;
  let sum = 0;
  let double = false;
  for (let i = digits.length - 1; i >= 0; i -= 1) {
    let digit = digits.charCodeAt(i) - 48;
    if (double) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    double = !double;
  }
  return sum % 10 === 0;
}

/** "MM/AA" as the buyer types, inserting the slash and a leading zero. */
export function formatExpiry(value: string): string {
  let digits = digitsOnly(value).slice(0, 4);
  if (digits.length === 1 && Number(digits) > 1) digits = `0${digits}`;
  if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return digits;
}

const CARDHOLDER_ALLOWED = /[^\p{L}\p{M}' .-]/gu;

/** Letters, spaces, apostrophes, dots, hyphens. Digits never land in the field. */
export function formatCardholderName(value: string): string {
  return value.replace(CARDHOLDER_ALLOWED, "").slice(0, 80);
}

/**
 * A Honduran DNI is 13 digits. The field used to take 5 to 20 alphanumeric
 * characters, so a typo reached Paygate and came back as a generic rejection
 * the buyer could not act on.
 */
export const ID_NUMBER_LENGTH = 13;

export function formatIdNumber(value: string): string {
  return digitsOnly(value).slice(0, ID_NUMBER_LENGTH);
}

export function parseExpiry(
  value: string,
  now: Date = new Date(),
): { month: number; year: number } | null {
  const digits = digitsOnly(value);
  if (digits.length !== 4) return null;
  const month = Number(digits.slice(0, 2));
  const year = 2000 + Number(digits.slice(2));
  if (month < 1 || month > 12) return null;
  // Valid through the last day of the expiry month.
  if (now.getTime() >= Date.UTC(year, month, 1)) return null;
  return { month, year };
}

export interface CardDraft {
  number: string;
  name: string;
  expiry: string;
  cvv: string;
  idNumber: string;
}

export const EMPTY_CARD_DRAFT: CardDraft = {
  number: "",
  name: "",
  expiry: "",
  cvv: "",
  idNumber: "",
};

export type CardDraftErrors = Partial<Record<keyof CardDraft, string>>;

/** Same rule the API enforces: letters, spaces, apostrophes, dots, hyphens. */
export const CARDHOLDER_NAME_RE = /^[\p{L}\p{M}][\p{L}\p{M}' .-]{1,79}$/u;

export function validateCardDraft(
  draft: CardDraft,
  { needsIdNumber }: { needsIdNumber: boolean },
): CardDraftErrors {
  const errors: CardDraftErrors = {};
  const digits = digitsOnly(draft.number);
  const brand = detectBrand(digits);
  const panMax = maxDigits(brand);
  if (digits.length < panMax) errors.number = "El número está incompleto";
  else if (digits.length > panMax || !passesLuhn(digits)) {
    errors.number = "Revisa el número de tarjeta";
  }
  if (!CARDHOLDER_NAME_RE.test(draft.name.trim())) {
    errors.name = "Escribe el nombre como aparece en la tarjeta";
  }
  if (!parseExpiry(draft.expiry)) errors.expiry = "Fecha inválida o vencida";
  if (!new RegExp(`^\\d{${cvvLength(brand)}}$`).test(draft.cvv)) {
    errors.cvv = `${cvvLength(brand)} dígitos`;
  }
  if (needsIdNumber && !new RegExp(`^\\d{${ID_NUMBER_LENGTH}}$`).test(draft.idNumber.trim())) {
    errors.idNumber = `Tu DNI tiene ${ID_NUMBER_LENGTH} dígitos`;
  }
  return errors;
}
