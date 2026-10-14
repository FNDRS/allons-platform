import { Input } from "@/components/ui/Field";
import { Segmented } from "@/components/ui/Segmented";
import {
  CATALOG_KIND_HINTS,
  CATALOG_KIND_OPTIONS,
  type CatalogDraft,
} from "@/hooks/useClassCatalogForm";
import { parsePositiveInt } from "@/hooks/class-program-form/constants";
import { ClassFormField } from "../ClassFormField";
import { membershipPriceLabel } from "./catalogFormat";

const digits = (value: string) => value.replace(/\D/g, "");

function NumberField({
  label,
  hint,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <ClassFormField label={label} hint={hint}>
      {(id) => (
        <Input
          id={id}
          inputMode="numeric"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(digits(e.target.value))}
        />
      )}
    </ClassFormField>
  );
}

/** Kind, price and the limits that apply to that kind. */
export function CatalogPlanFields({
  draft,
  onChange,
}: {
  draft: CatalogDraft;
  onChange: (patch: Partial<CatalogDraft>) => void;
}) {
  const membership = draft.kind === "membership";
  const price = Number(draft.price);
  const months = parsePositiveInt(draft.billingMonths);
  const priceHint =
    membership && price > 0 && months ? membershipPriceLabel(price, months) : undefined;

  return (
    <>
      <ClassFormField label="Tipo" hint={CATALOG_KIND_HINTS[draft.kind]}>
        <Segmented
          label="Tipo"
          value={draft.kind}
          options={CATALOG_KIND_OPTIONS}
          onChange={(kind) => onChange({ kind })}
        />
      </ClassFormField>
      <div className="grid gap-4 sm:grid-cols-2">
        <ClassFormField label={membership ? "Precio por mes (HNL)" : "Precio (HNL)"} hint={priceHint}>
          {(id) => (
            <Input
              id={id}
              inputMode="decimal"
              placeholder={membership ? "6100" : "2000"}
              value={draft.price}
              onChange={(e) => onChange({ price: e.target.value.replace(/[^0-9.]/g, "") })}
            />
          )}
        </ClassFormField>
        {draft.kind === "pack" ? (
          <NumberField
            label="Clases incluidas"
            placeholder="8"
            value={draft.credits}
            onChange={(credits) => onChange({ credits })}
          />
        ) : null}
        {membership ? (
          <NumberField
            label="Meses de cobro"
            hint="De 1 a 24. Se cobra una cuota cada mes."
            placeholder="6"
            value={draft.billingMonths}
            onChange={(billingMonths) => onChange({ billingMonths })}
          />
        ) : (
          <NumberField
            label={draft.kind === "unlimited" ? "Vence en (días)" : "Vence en (días) · opcional"}
            placeholder="30"
            value={draft.validityDays}
            onChange={(validityDays) => onChange({ validityDays })}
          />
        )}
        <NumberField
          label="Máximo de clases por día"
          hint="Opcional. Vacío es sin límite."
          placeholder="Sin límite"
          value={draft.dailyLimit}
          onChange={(dailyLimit) => onChange({ dailyLimit })}
        />
        {membership ? (
          <NumberField
            label="Invitados por mes"
            hint="Opcional. Pases de una clase que el miembro puede regalar."
            placeholder="0"
            value={draft.guestPassesPerMonth}
            onChange={(guestPassesPerMonth) => onChange({ guestPassesPerMonth })}
          />
        ) : null}
      </div>
    </>
  );
}
