"use client";

import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { useClassCatalogForm } from "@/hooks/useClassCatalogForm";
import type { CatalogPackage, CatalogPackageInput } from "@/lib/api/classCatalog";
import { ClassFormField } from "../ClassFormField";
import { CatalogBenefitsField } from "./CatalogBenefitsField";
import { CatalogPlanFields } from "./CatalogPlanFields";
import { CatalogProgramsField } from "./CatalogProgramsField";

/** Create or edit one package or membership. Mount it per edit. */
export function ClassCatalogEditorModal({
  item,
  programs,
  saving,
  onClose,
  onSave,
}: {
  item: CatalogPackage | null;
  programs: { id: string; title: string }[];
  saving: boolean;
  onClose: () => void;
  onSave: (body: CatalogPackageInput) => void;
}) {
  const f = useClassCatalogForm(item);
  const { draft } = f;

  return (
    <Modal
      open
      onClose={onClose}
      title={item ? "Editar paquete" : "Nuevo paquete o membresía"}
      footer={
        <div className="flex flex-wrap items-center justify-end gap-2">
          {f.error ? <p className="mr-auto text-[13px] text-red-300">{f.error}</p> : null}
          <Button variant="secondary" size="sm" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            size="sm"
            loading={saving}
            disabled={Boolean(f.error)}
            onClick={() => onSave(f.toPayload())}
          >
            Guardar
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <ClassFormField label="Nombre">
          {(id) => (
            <Input
              id={id}
              placeholder="Ej. Membresía 6 meses"
              value={draft.name}
              maxLength={120}
              onChange={(e) => f.update({ name: e.target.value })}
            />
          )}
        </ClassFormField>
        <CatalogPlanFields draft={draft} onChange={f.update} />
        <ClassFormField label="Descripción" hint="Opcional.">
          {(id) => (
            <Textarea
              id={id}
              rows={3}
              placeholder="Qué incluye y para quién es"
              value={draft.description}
              onChange={(e) => f.update({ description: e.target.value })}
            />
          )}
        </ClassFormField>
        <CatalogBenefitsField
          benefits={draft.benefits}
          onAdd={f.addBenefit}
          onChange={f.setBenefit}
          onRemove={f.removeBenefit}
        />
        <CatalogProgramsField
          programs={programs}
          allPrograms={draft.allPrograms}
          selectedIds={draft.programIds}
          onAllProgramsChange={(allPrograms) => f.update({ allPrograms })}
          onToggle={f.toggleProgram}
        />
      </div>
    </Modal>
  );
}
