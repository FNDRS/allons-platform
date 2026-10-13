import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { Chip } from "@/components/ui/Pill";
import {
  CLASS_PACKAGE_KIND_HINTS,
  CLASS_PACKAGE_KIND_LABELS,
  CLASS_PACKAGE_KINDS,
} from "@/hooks/class-program-form/constants";
import type { ClassPackageDraft } from "@/hooks/class-program-form/useClassPackagesForm";
import { ClassFormField } from "./ClassFormField";

const digits = (value: string) => value.replace(/\D/g, "");

/** Authors one sellable package: kind, name, price, sessions and validity. */
export function ClassPackageEditorModal({
  draft,
  error,
  onChange,
  onCancel,
  onConfirm,
}: {
  draft: ClassPackageDraft | null;
  error: string | null;
  onChange: (patch: Partial<ClassPackageDraft>) => void;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal
      open={Boolean(draft)}
      onClose={onCancel}
      title="Paquete de sesiones"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" size="sm" onClick={onCancel}>
            Cancelar
          </Button>
          <Button size="sm" disabled={Boolean(error)} onClick={onConfirm}>
            Guardar paquete
          </Button>
        </div>
      }
    >
      {draft ? (
        <div className="flex flex-col gap-4">
          <ClassFormField label="Tipo" hint={CLASS_PACKAGE_KIND_HINTS[draft.kind]}>
            <div className="flex flex-wrap gap-2">
              {CLASS_PACKAGE_KINDS.map((kind) => (
                <Chip key={kind} active={draft.kind === kind} onClick={() => onChange({ kind })}>
                  {CLASS_PACKAGE_KIND_LABELS[kind]}
                </Chip>
              ))}
            </div>
          </ClassFormField>
          <ClassFormField label="Nombre">
            {(id) => (
              <Input
                id={id}
                placeholder="Pack 8 sesiones"
                value={draft.name}
                onChange={(e) => onChange({ name: e.target.value })}
              />
            )}
          </ClassFormField>
          <ClassFormField label="Precio (HNL)" hint="Déjalo vacío o en 0 para un paquete gratis.">
            {(id) => (
              <Input
                id={id}
                inputMode="decimal"
                placeholder="2000"
                value={draft.price}
                onChange={(e) => onChange({ price: e.target.value.replace(/[^0-9.]/g, "") })}
              />
            )}
          </ClassFormField>
          {draft.kind === "pack" ? (
            <ClassFormField label="Sesiones incluidas">
              {(id) => (
                <Input
                  id={id}
                  inputMode="numeric"
                  placeholder="8"
                  value={draft.credits}
                  onChange={(e) => onChange({ credits: digits(e.target.value) })}
                />
              )}
            </ClassFormField>
          ) : null}
          {draft.kind !== "drop_in" ? (
            <ClassFormField label={draft.kind === "pack" ? "Vence en (días) · opcional" : "Vence en (días)"}>
              {(id) => (
                <Input
                  id={id}
                  inputMode="numeric"
                  placeholder="90"
                  value={draft.validityDays}
                  onChange={(e) => onChange({ validityDays: digits(e.target.value) })}
                />
              )}
            </ClassFormField>
          ) : null}
          {error ? <p className="text-[13px] text-red-300">{error}</p> : null}
        </div>
      ) : null}
    </Modal>
  );
}
