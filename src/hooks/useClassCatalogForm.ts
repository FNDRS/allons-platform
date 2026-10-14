"use client";

import { useState } from "react";
import type {
  CatalogPackage,
  CatalogPackageInput,
  CatalogPackageKind,
} from "@/lib/api/classCatalog";
import { parsePositiveInt } from "./class-program-form/constants";

export const CATALOG_KIND_OPTIONS: { value: CatalogPackageKind; label: string }[] = [
  { value: "drop_in", label: "Por clase" },
  { value: "pack", label: "Paquete" },
  { value: "unlimited", label: "Ilimitado" },
  { value: "membership", label: "Membresía" },
];

export const CATALOG_KIND_HINTS: Record<CatalogPackageKind, string> = {
  drop_in: "Una sola clase.",
  pack: "Varias clases con un precio por paquete.",
  unlimited: "Clases sin límite durante unos días.",
  membership: "Se cobra cada mes a la tarjeta del cliente durante los meses que definas.",
};

export const MAX_BENEFITS = 12;

/** Everything the editor shows, as typed. */
export interface CatalogDraft {
  name: string;
  kind: CatalogPackageKind;
  price: string;
  credits: string;
  validityDays: string;
  billingMonths: string;
  dailyLimit: string;
  guestPassesPerMonth: string;
  description: string;
  benefits: string[];
  /** Empty means every program. */
  programIds: string[];
  allPrograms: boolean;
}

const str = (value: number | null | undefined) => (value == null ? "" : String(value));

function fromItem(item: CatalogPackage | null): CatalogDraft {
  return {
    name: item?.name ?? "",
    kind: item?.kind ?? "pack",
    price: str(item?.price),
    credits: item ? str(item.credits) : "8",
    validityDays: item ? str(item.validityDays) : "30",
    billingMonths: item ? str(item.billingMonths) : "6",
    dailyLimit: str(item?.dailyLimit),
    guestPassesPerMonth: str(item?.guestPassesPerMonth),
    description: item?.description ?? "",
    benefits: item?.benefits ?? [],
    programIds: item?.programIds ?? [],
    allPrograms: !item || item.programIds.length === 0,
  };
}

/** Why the draft cannot be saved yet, or null. Mirrors the API rules. */
function draftError(draft: CatalogDraft): string | null {
  if (!draft.name.trim()) return "Ponle un nombre.";
  const price = Number(draft.price);
  if (!Number.isFinite(price) || price < 0) return "Revisa el precio.";
  if (draft.kind === "membership" && price <= 0) return "Una membresía necesita precio.";
  if (draft.kind === "pack" && (parsePositiveInt(draft.credits) ?? 0) < 2) {
    return "Un paquete debe incluir 2 clases o más.";
  }
  if (draft.kind === "unlimited" && parsePositiveInt(draft.validityDays) === null) {
    return "Indica por cuántos días vale el pase ilimitado.";
  }
  if (draft.kind === "membership") {
    const months = parsePositiveInt(draft.billingMonths);
    if (months === null || months > 24) return "La membresía dura de 1 a 24 meses.";
  }
  if (!draft.allPrograms && draft.programIds.length === 0) return "Elige al menos un programa.";
  return null;
}

/** Sends `kind` every time: the API changes credits, days and months only with it. */
function toPayload(draft: CatalogDraft): CatalogPackageInput {
  const membership = draft.kind === "membership";
  return {
    name: draft.name.trim(),
    kind: draft.kind,
    price: Number(draft.price) || 0,
    credits: draft.kind === "pack" ? parsePositiveInt(draft.credits) : null,
    validityDays: membership ? null : parsePositiveInt(draft.validityDays),
    billingMonths: membership ? parsePositiveInt(draft.billingMonths) : null,
    dailyLimit: parsePositiveInt(draft.dailyLimit),
    guestPassesPerMonth: membership ? parsePositiveInt(draft.guestPassesPerMonth) : null,
    description: draft.description.trim() || null,
    benefits: draft.benefits.map((item) => item.trim()).filter(Boolean),
    programIds: draft.allPrograms ? [] : draft.programIds,
  };
}

/** Editor state for one catalog item. Mount it per edit: it seeds once. */
export function useClassCatalogForm(item: CatalogPackage | null) {
  const [draft, setDraft] = useState<CatalogDraft>(() => fromItem(item));
  const update = (patch: Partial<CatalogDraft>) => setDraft((current) => ({ ...current, ...patch }));

  return {
    draft,
    update,
    error: draftError(draft),
    toggleProgram: (id: string) =>
      update({
        programIds: draft.programIds.includes(id)
          ? draft.programIds.filter((item) => item !== id)
          : [...draft.programIds, id],
      }),
    addBenefit: () => {
      if (draft.benefits.length < MAX_BENEFITS) update({ benefits: [...draft.benefits, ""] });
    },
    setBenefit: (index: number, value: string) =>
      update({ benefits: draft.benefits.map((item, i) => (i === index ? value : item)) }),
    removeBenefit: (index: number) =>
      update({ benefits: draft.benefits.filter((_, i) => i !== index) }),
    toPayload: () => toPayload(draft),
  };
}
