import { apiFetch } from "./client";

export type CatalogPackageKind = "drop_in" | "pack" | "unlimited" | "membership";

export interface CatalogPackageInput {
  name: string;
  kind: CatalogPackageKind;
  /** Lempiras. For a membership, the price of each month. */
  price: number;
  /** Pack only (2 or more). A drop-in is always 1. */
  credits?: number | null;
  /** Required for unlimited, ignored for membership. */
  validityDays?: number | null;
  /** Membership only, 1 to 24. */
  billingMonths?: number | null;
  /** Most classes a pass allows per day. */
  dailyLimit?: number | null;
  /** Membership only. */
  guestPassesPerMonth?: number | null;
  description?: string | null;
  benefits?: string[];
  sortOrder?: number;
  /** Empty means every program of the comercio. */
  programIds?: string[];
}

/** A package or membership sold across the comercio, not tied to one program. */
export interface CatalogPackage {
  id: string;
  providerId: string;
  programId: null;
  name: string;
  kind: CatalogPackageKind;
  price: number;
  credits: number | null;
  validityDays: number | null;
  billingMonths: number | null;
  dailyLimit: number | null;
  guestPassesPerMonth: number | null;
  description: string | null;
  benefits: string[];
  sortOrder: number;
  active: boolean;
  programIds: string[];
  programTitles: string[];
  soldCount?: number;
}

export const classCatalogKeys = {
  all: ["provider", "class-catalog"] as const,
};

const base = "/provider/class-catalog";
const itemPath = (id: string) => `${base}/${encodeURIComponent(id)}`;

export const listClassCatalog = () => apiFetch<CatalogPackage[]>(base);

export const createCatalogPackage = (body: CatalogPackageInput) =>
  apiFetch<CatalogPackage>(base, { method: "POST", body });

/** Send `kind` along with credits, validity or billing months to change them. */
export const updateCatalogPackage = (
  id: string,
  body: Partial<CatalogPackageInput> & { active?: boolean },
) => apiFetch<CatalogPackage>(itemPath(id), { method: "PATCH", body });

/** Deactivates: it stops selling, existing passes keep working. */
export const deactivateCatalogPackage = (id: string) =>
  apiFetch<void>(itemPath(id), { method: "DELETE" });
