import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { MAX_BENEFITS } from "@/hooks/useClassCatalogForm";
import { ClassFormField } from "../ClassFormField";

/** The bullet list a client reads under the price. */
export function CatalogBenefitsField({
  benefits,
  onAdd,
  onChange,
  onRemove,
}: {
  benefits: string[];
  onAdd: () => void;
  onChange: (index: number, value: string) => void;
  onRemove: (index: number) => void;
}) {
  return (
    <ClassFormField label="Beneficios" hint={`Opcional, hasta ${MAX_BENEFITS}.`}>
      <div className="flex flex-col gap-2">
        {benefits.map((benefit, index) => (
          <div key={index} className="flex items-center gap-2">
            <Input
              aria-label={`Beneficio ${index + 1}`}
              placeholder="Ej. Toalla y agua incluidas"
              value={benefit}
              maxLength={120}
              className="flex-1"
              onChange={(e) => onChange(index, e.target.value)}
            />
            <Button
              variant="glass"
              size="icon-sm"
              aria-label={`Quitar beneficio ${index + 1}`}
              onClick={() => onRemove(index)}
            >
              <X className="size-3.5" aria-hidden />
            </Button>
          </div>
        ))}
        {benefits.length < MAX_BENEFITS ? (
          <Button variant="secondary" size="sm" className="self-start" onClick={onAdd}>
            <Plus className="size-4" aria-hidden />
            Agregar beneficio
          </Button>
        ) : null}
      </div>
    </ClassFormField>
  );
}
