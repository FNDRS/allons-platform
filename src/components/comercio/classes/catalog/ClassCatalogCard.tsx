import { Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StatusPill } from "@/components/ui/Pill";
import type { CatalogPackage } from "@/lib/api/classCatalog";
import { formatCardPrice, formatNumber } from "@/lib/format";
import { CATALOG_KIND_LABELS, catalogPlanDetails, membershipPriceLabel } from "./catalogFormat";

/** One package or membership with what it includes, its sales and actions. */
export function ClassCatalogCard({
  item,
  toggling,
  onEdit,
  onToggleActive,
}: {
  item: CatalogPackage;
  toggling: boolean;
  onEdit: () => void;
  onToggleActive: () => void;
}) {
  const price =
    item.kind === "membership"
      ? membershipPriceLabel(item.price, item.billingMonths ?? 1)
      : formatCardPrice(Math.round(item.price * 100));
  const sold = item.soldCount ?? 0;
  return (
    <Card className={`flex flex-col gap-3 ${item.active ? "" : "opacity-60"}`}>
      <div className="flex flex-wrap items-center gap-2">
        <StatusPill tone="gray">{CATALOG_KIND_LABELS[item.kind]}</StatusPill>
        {item.active ? null : <StatusPill tone="mute">Inactivo</StatusPill>}
        <span className="ml-auto text-[12px] text-white/45">
          {`${formatNumber(sold)} ${sold === 1 ? "vendido" : "vendidos"}`}
        </span>
      </div>
      <div>
        <p className="text-[17px] font-bold tracking-tight">{item.name}</p>
        <p className="mt-0.5 text-[15px] font-semibold tabular-nums">{price}</p>
        <p className="mt-1 text-[13px] text-white/50">{catalogPlanDetails(item)}</p>
      </div>
      {item.benefits.length > 0 ? (
        <ul className="flex flex-col gap-1 text-[13px] text-white/70">
          {item.benefits.map((benefit) => (
            <li key={benefit} className="flex items-start gap-2">
              <Check className="mt-0.5 size-3.5 shrink-0 text-accent" aria-hidden />
              {benefit}
            </li>
          ))}
        </ul>
      ) : null}
      <p className="text-[12px] text-white/45">
        {item.programIds.length === 0 ? "Todos los programas" : item.programTitles.join(" · ")}
      </p>
      <div className="mt-auto flex gap-2 pt-1">
        <Button variant="secondary" size="sm" onClick={onEdit}>
          Editar
        </Button>
        <Button variant="ghost" size="sm" loading={toggling} onClick={onToggleActive}>
          {item.active ? "Desactivar" : "Activar"}
        </Button>
      </div>
    </Card>
  );
}
