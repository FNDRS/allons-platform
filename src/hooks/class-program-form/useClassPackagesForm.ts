"use client";

import { useState } from "react";
import type {
  ClassPackage,
  ClassPackageInput,
  ClassPackageKind,
} from "@/lib/api/providerClassPrograms";
import { CLASS_PACKAGE_KIND_LABELS, parsePositiveInt } from "./constants";
import { useDraftPersistence } from "./useDraftPersistence";

/** A sellable package being authored. `id` is local until the API assigns one. */
export interface ClassPackageDraft {
  id: string;
  name: string;
  kind: ClassPackageKind;
  /** Lempiras as typed. */
  price: string;
  /** Sessions granted. Empty for `unlimited`, which is bounded by days. */
  credits: string;
  /** Days before an unused pass expires. Empty means never. */
  validityDays: string;
}

let draftSeq = 0;
const nextDraftId = () => `package-draft-${++draftSeq}`;

const DEFAULT_VALIDITY_BY_KIND: Record<ClassPackageKind, string> = {
  drop_in: "",
  pack: "30",
  unlimited: "30",
};

function emptyDraft(kind: ClassPackageKind = "drop_in"): ClassPackageDraft {
  return {
    id: nextDraftId(),
    name: CLASS_PACKAGE_KIND_LABELS[kind],
    kind,
    price: "",
    credits: kind === "pack" ? "4" : kind === "drop_in" ? "1" : "",
    validityDays: DEFAULT_VALIDITY_BY_KIND[kind],
  };
}

/** Why a draft cannot be saved yet, or null. Mirrors the API rules. */
export function classPackageDraftError(draft: ClassPackageDraft): string | null {
  if (!draft.name.trim()) return "Ponle un nombre al paquete.";
  const price = Number(draft.price);
  // Empty is a free package, which clients claim without paying.
  if (!Number.isFinite(price) || price < 0) return "Revisa el precio.";
  if (draft.kind === "pack") {
    const credits = parsePositiveInt(draft.credits);
    if (credits === null) return "Indica cuántas sesiones incluye el paquete.";
    if (credits < 2) return "Un paquete debe incluir 2 sesiones o más.";
  }
  if (draft.kind === "unlimited" && parsePositiveInt(draft.validityDays) === null) {
    return "Indica por cuántos días vale el pase ilimitado.";
  }
  return null;
}

/** Price per session of a pack, so the comercio sees what it really charges. */
export function classPackageUnitPrice(draft: ClassPackageDraft): number | null {
  const price = Number(draft.price);
  if (draft.kind !== "pack" || !Number.isFinite(price) || price <= 0) return null;
  const credits = parsePositiveInt(draft.credits);
  return credits ? price / credits : null;
}

function fromPackage(item: ClassPackage): ClassPackageDraft {
  return {
    id: item.id,
    name: item.name,
    kind: item.kind,
    price: String(item.price),
    credits: item.credits == null ? "" : String(item.credits),
    validityDays: item.validityDays == null ? "" : String(item.validityDays),
  };
}

function toPayload(draft: ClassPackageDraft, sortOrder: number): ClassPackageInput {
  const validityDays = parsePositiveInt(draft.validityDays);
  return {
    name: draft.name.trim(),
    price: Number(draft.price) || 0,
    kind: draft.kind,
    ...(draft.kind === "unlimited"
      ? {}
      : { credits: draft.kind === "drop_in" ? 1 : (parsePositiveInt(draft.credits) ?? undefined) }),
    ...(validityDays !== null ? { validityDays } : {}),
    sortOrder,
  };
}

/** Sellable packages (paquetes) of a class program, edited in a modal. */
export function useClassPackagesForm(initial: ClassPackage[] = []) {
  const [packages, setPackages] = useState<ClassPackageDraft[]>(() => initial.map(fromPackage));
  const [editorDraft, setEditorDraft] = useState<ClassPackageDraft | null>(null);
  const persistence = useDraftPersistence(
    initial.map((item) => item.id),
    setPackages,
  );

  const editorError = editorDraft ? classPackageDraftError(editorDraft) : null;

  const updateEditor = (patch: Partial<ClassPackageDraft>) =>
    setEditorDraft((current) => {
      if (!current) return current;
      // A new kind re-seeds the fields that only make sense for that kind,
      // keeping the price and any name the comercio typed itself.
      if (patch.kind && patch.kind !== current.kind) {
        const seeded = emptyDraft(patch.kind);
        return {
          ...seeded,
          id: current.id,
          price: current.price,
          name:
            current.name === CLASS_PACKAGE_KIND_LABELS[current.kind] ? seeded.name : current.name,
        };
      }
      return { ...current, ...patch };
    });

  return {
    packages,
    hasPackages: packages.length > 0,
    editorDraft,
    editorError,
    openNew: () => setEditorDraft(emptyDraft()),
    openExisting: (id: string) => {
      const found = packages.find((item) => item.id === id);
      if (found) setEditorDraft({ ...found });
    },
    closeEditor: () => setEditorDraft(null),
    updateEditor,
    commitEditor: () => {
      if (!editorDraft || editorError) return;
      setPackages((current) =>
        current.some((item) => item.id === editorDraft.id)
          ? current.map((item) => (item.id === editorDraft.id ? editorDraft : item))
          : [...current, editorDraft],
      );
      setEditorDraft(null);
    },
    remove: (id: string) => setPackages((current) => current.filter((item) => item.id !== id)),
    toPayloads: () => packages.map(toPayload),
    markPersisted: persistence.markPersisted,
    markDeleted: persistence.markDeleted,
    toDiff: () => persistence.diff(packages, toPayload),
  };
}
