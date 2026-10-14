import type { CatalogPackageKind } from "@/lib/api/classCatalog";
import { formatCardPrice } from "@/lib/format";

export const CATALOG_KIND_LABELS: Record<CatalogPackageKind, string> = {
  drop_in: "Por clase",
  pack: "Paquete",
  unlimited: "Ilimitado",
  membership: "Membresía",
};

const lempiras = (amount: number) => formatCardPrice(Math.round(amount * 100));

/** "HNL 6,100 por mes, HNL 36,600 en 6 cuotas". */
export function membershipPriceLabel(price: number, months: number): string {
  if (months <= 1) return `${lempiras(price)} por mes`;
  return `${lempiras(price)} por mes, ${lempiras(price * months)} en ${months} cuotas`;
}

type PlanShape = {
  kind: CatalogPackageKind;
  credits: number | null;
  validityDays: number | null;
  billingMonths: number | null;
  dailyLimit: number | null;
  guestPassesPerMonth: number | null;
};

/** "8 clases · vence en 30 días · hasta 2 clases por día". */
export function catalogPlanDetails(item: PlanShape): string {
  const parts: string[] = [];
  if (item.kind === "membership") {
    parts.push(item.billingMonths === 1 ? "1 mes" : `${item.billingMonths ?? "?"} meses`);
  } else if (item.kind === "unlimited") {
    parts.push("Clases ilimitadas");
  } else if (item.kind === "pack") {
    parts.push(`${item.credits ?? "?"} clases`);
  } else {
    parts.push("1 clase");
  }
  if (item.kind !== "membership") {
    parts.push(item.validityDays ? `vence en ${item.validityDays} días` : "sin vencimiento");
  }
  if (item.dailyLimit) {
    parts.push(`hasta ${item.dailyLimit} ${item.dailyLimit === 1 ? "clase" : "clases"} por día`);
  }
  if (item.guestPassesPerMonth) {
    parts.push(
      `${item.guestPassesPerMonth} ${item.guestPassesPerMonth === 1 ? "invitado" : "invitados"} al mes`,
    );
  }
  return parts.join(" · ");
}
