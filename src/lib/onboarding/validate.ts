import type { OnboardingSubmission } from "@/lib/api/onboarding";
import { EVENT_CATEGORIES } from "@/lib/eventCategories";
import { OTHER_BANK } from "./banks";

/**
 * Reglas del registro de comercio, sin React: el hook las corre al avanzar de
 * paso y antes de enviar. Son las mismas que valida la API (contrato en
 * allons-api `comercio-onboarding`), para que el comercio vea el error aquí y
 * no después de enviar.
 */

export type UploadedImage = { url: string; name: string };

export type OnboardingDraft = {
  company: {
    brandName: string;
    contactName: string;
    email: string;
    /** Sólo los 8 dígitos, sin +504. */
    phone: string;
    whatsapp: string;
    instagram: string;
    websiteUrl: string;
    description: string;
    logos: UploadedImage[];
  };
  billing: {
    accountHolder: string;
    bank: string;
    bankOther: string;
    accountType: "ahorro" | "cheques";
    accountNumber: string;
    taxId: string;
  };
  event: {
    title: string;
    description: string;
    date: string;
    time: string;
    venue: string;
    address: string;
    mapsUrl: string;
    category: string;
    isFree: boolean;
    ticketPrice: string;
    capacity: string;
    croquis: UploadedImage[];
  };
};

export type OnboardingStep = "company" | "billing" | "event" | "review";

/** Clave `seccion.campo` → mensaje. */
export type OnboardingErrors = Record<string, string>;

export const MAX_IMAGES = 5;

export function emptyDraft(email: string | null): OnboardingDraft {
  return {
    company: {
      brandName: "",
      contactName: "",
      email: email ?? "",
      phone: "",
      whatsapp: "",
      instagram: "",
      websiteUrl: "",
      description: "",
      logos: [],
    },
    billing: {
      accountHolder: "",
      bank: "",
      bankOther: "",
      accountType: "ahorro",
      accountNumber: "",
      taxId: "",
    },
    event: {
      title: "",
      description: "",
      date: "",
      time: "",
      venue: "",
      address: "",
      mapsUrl: "",
      category: "",
      isFree: false,
      ticketPrice: "",
      capacity: "",
      croquis: [],
    },
  };
}

/** Hoy en Honduras como `YYYY-MM-DD` (en-CA da justo ese formato). */
export function todayInHonduras(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Tegucigalpa",
  }).format(new Date());
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\d{8}$/;
const INSTAGRAM_RE = /^[A-Za-z0-9._]{1,30}$/;
const ACCOUNT_RE = /^[\d-]{6,30}$/;
const RTN_RE = /^\d{14}$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const MAPS_HOST_RE = /(^|\.)(google\.[a-z.]+|goo\.gl)$/i;

/** `@marca`, `instagram.com/marca/` o `marca` → `marca`. */
export function normalizeInstagram(raw: string): string {
  return raw
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/^(www\.)?instagram\.com\//i, "")
    .replace(/^@/, "")
    .replace(/[/?#].*$/, "");
}

export function digitsOnly(raw: string): string {
  return raw.replace(/\D/g, "");
}

function isHttpUrl(raw: string): URL | null {
  try {
    const url = new URL(raw);
    return url.protocol === "http:" || url.protocol === "https:" ? url : null;
  } catch {
    return null;
  }
}

/** Una web escrita como `marca.com` también vale: se le pone https. */
export function normalizeWebsite(raw: string): string {
  const value = raw.trim();
  if (!value) return "";
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

function required(value: string, max: number, label: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return `${label} es obligatorio.`;
  if (trimmed.length > max) return `Máximo ${max} caracteres.`;
  return null;
}

function optional(value: string, max: number): string | null {
  return value.trim().length > max ? `Máximo ${max} caracteres.` : null;
}

function collect(entries: Array<[string, string | null]>): OnboardingErrors {
  const errors: OnboardingErrors = {};
  for (const [key, message] of entries) if (message) errors[key] = message;
  return errors;
}

export function validateCompany(c: OnboardingDraft["company"]): OnboardingErrors {
  const website = normalizeWebsite(c.websiteUrl);
  return collect([
    ["company.brandName", required(c.brandName, 120, "El nombre de la empresa")],
    ["company.contactName", required(c.contactName, 120, "El nombre de la persona a cargo")],
    [
      "company.email",
      !c.email.trim()
        ? "El correo es obligatorio."
        : EMAIL_RE.test(c.email.trim())
          ? null
          : "Revisa el correo, parece incompleto.",
    ],
    [
      "company.phone",
      PHONE_RE.test(c.phone) ? null : "Escribe los 8 dígitos del teléfono.",
    ],
    [
      "company.whatsapp",
      !c.whatsapp || PHONE_RE.test(c.whatsapp) ? null : "Escribe los 8 dígitos o déjalo vacío.",
    ],
    [
      "company.instagram",
      !normalizeInstagram(c.instagram)
        ? "La cuenta de Instagram es obligatoria."
        : INSTAGRAM_RE.test(normalizeInstagram(c.instagram))
          ? null
          : "Usa sólo letras, números, puntos y guiones bajos.",
    ],
    [
      "company.websiteUrl",
      !website
        ? null
        : website.length > 300 || !isHttpUrl(website)
          ? "Revisa el enlace de tu web."
          : null,
    ],
    ["company.description", optional(c.description, 500)],
    ["company.logos", c.logos.length > 0 ? null : "Sube al menos un logo."],
  ]);
}

export function bankName(b: OnboardingDraft["billing"]): string {
  return b.bank === OTHER_BANK ? b.bankOther.trim() : b.bank;
}

export function validateBilling(b: OnboardingDraft["billing"]): OnboardingErrors {
  const rtn = digitsOnly(b.taxId);
  return collect([
    ["billing.accountHolder", required(b.accountHolder, 200, "El titular de la cuenta")],
    ["billing.bank", b.bank ? null : "Elige el banco."],
    [
      "billing.bankOther",
      b.bank === OTHER_BANK ? required(b.bankOther, 120, "El nombre del banco") : null,
    ],
    [
      "billing.accountNumber",
      ACCOUNT_RE.test(b.accountNumber.trim())
        ? null
        : "Escribe el número de cuenta, sólo dígitos y guiones.",
    ],
    ["billing.taxId", !rtn || RTN_RE.test(rtn) ? null : "El RTN tiene 14 dígitos."],
  ]);
}

export function validateEvent(e: OnboardingDraft["event"]): OnboardingErrors {
  const price = Number(e.ticketPrice);
  const capacity = Number(e.capacity);
  const maps = e.mapsUrl.trim() ? isHttpUrl(e.mapsUrl.trim()) : null;
  return collect([
    ["event.title", required(e.title, 120, "El nombre del evento")],
    ["event.description", required(e.description, 2000, "La descripción")],
    [
      "event.date",
      !DATE_RE.test(e.date)
        ? "Elige la fecha."
        : e.date < todayInHonduras()
          ? "La fecha ya pasó."
          : null,
    ],
    ["event.time", TIME_RE.test(e.time) ? null : "Elige la hora."],
    ["event.venue", optional(e.venue, 120)],
    ["event.address", required(e.address, 300, "La dirección")],
    [
      "event.mapsUrl",
      !e.mapsUrl.trim()
        ? null
        : maps && maps.protocol === "https:" && MAPS_HOST_RE.test(maps.hostname)
          ? null
          : "Pega el enlace que da Google Maps al compartir.",
    ],
    [
      "event.category",
      EVENT_CATEGORIES.includes(e.category) ? null : "Elige el tipo de evento.",
    ],
    [
      "event.ticketPrice",
      e.isFree
        ? null
        : !e.ticketPrice.trim()
          ? "Escribe el precio o marca el evento como gratis."
          : Number.isFinite(price) && price > 0
            ? null
            : "Escribe un precio mayor a 0.",
    ],
    [
      "event.capacity",
      Number.isInteger(capacity) && capacity >= 1 && capacity <= 100000
        ? null
        : "Escribe cuántas personas caben.",
    ],
  ]);
}

export function validateStep(step: OnboardingStep, draft: OnboardingDraft): OnboardingErrors {
  if (step === "company") return validateCompany(draft.company);
  if (step === "billing") return validateBilling(draft.billing);
  if (step === "event") return validateEvent(draft.event);
  return {
    ...validateCompany(draft.company),
    ...validateBilling(draft.billing),
    ...validateEvent(draft.event),
  };
}

const nullable = (value: string) => value.trim() || null;

export function toSubmission(draft: OnboardingDraft): OnboardingSubmission {
  const { company: c, billing: b, event: e } = draft;
  return {
    company: {
      brandName: c.brandName.trim(),
      contactName: c.contactName.trim(),
      email: c.email.trim().toLowerCase(),
      phone: c.phone,
      whatsapp: c.whatsapp || null,
      instagram: normalizeInstagram(c.instagram),
      websiteUrl: nullable(normalizeWebsite(c.websiteUrl)),
      description: nullable(c.description),
      logoUrls: c.logos.map((logo) => logo.url),
    },
    billing: {
      accountHolder: b.accountHolder.trim(),
      bankName: bankName(b),
      accountType: b.accountType,
      accountNumber: b.accountNumber.trim(),
      taxId: digitsOnly(b.taxId) || null,
    },
    event: {
      title: e.title.trim(),
      description: e.description.trim(),
      date: e.date,
      time: e.time,
      venue: nullable(e.venue),
      address: e.address.trim(),
      mapsUrl: nullable(e.mapsUrl),
      category: e.category,
      ticketPrice: e.isFree ? null : Number(e.ticketPrice),
      capacity: Number(e.capacity),
      croquisUrls: e.croquis.map((file) => file.url),
    },
  };
}

/** `12345678901` → `••••8901`. */
export function maskAccount(raw: string): string {
  const digits = digitsOnly(raw);
  return digits.length > 4 ? `••••${digits.slice(-4)}` : digits;
}

/** `99998888` → `9999 8888`. */
export function formatPhone(digits: string): string {
  return digits.length > 4 ? `${digits.slice(0, 4)} ${digits.slice(4)}` : digits;
}

/** `08011999123456` → `0801-1999-123456`, como viene impreso en la tarjeta. */
export function formatRtn(raw: string): string {
  const d = digitsOnly(raw).slice(0, 14);
  return [d.slice(0, 4), d.slice(4, 8), d.slice(8)].filter(Boolean).join("-");
}
