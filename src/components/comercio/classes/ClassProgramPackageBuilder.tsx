import { CLASS_PACKAGE_KIND_LABELS } from "@/hooks/class-program-form/constants";
import {
  classPackageUnitPrice,
  type ClassPackageDraft,
} from "@/hooks/class-program-form/useClassPackagesForm";
import { formatHNL } from "@/lib/format";
import { ClassBuilderSection } from "./ClassBuilderSection";
import { ClassDraftRow } from "./ClassDraftRow";
import { packageDetails } from "./classProgramFormat";

/** Sellable packages (paquetes) the program offers. */
export function ClassProgramPackageBuilder({
  packages,
  catalogPackageCount,
  onAdd,
  onEdit,
  onRemove,
}: {
  packages: ClassPackageDraft[];
  /** Active comercio-wide packages that already sell this program. */
  catalogPackageCount: number;
  onAdd: () => void;
  onEdit: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <ClassBuilderSection
      title="Paquetes"
      intro="Define cómo se venden las sesiones: entrada suelta, paquetes de varias sesiones o un pase ilimitado."
      addLabel="Agregar paquete"
      emptyHint={
        catalogPackageCount > 0
          ? `Este programa ya se vende con ${catalogPackageCount} ${catalogPackageCount === 1 ? "paquete" : "paquetes"} de Paquetes y membresías. Agrega uno aquí solo si es exclusivo de este programa.`
          : "Agrega un paquete aquí o en Paquetes y membresías para poder publicar el programa."
      }
      isEmpty={packages.length === 0}
      onAdd={onAdd}
    >
      {packages.map((draft) => {
        const name = draft.name || CLASS_PACKAGE_KIND_LABELS[draft.kind];
        const price = Number(draft.price);
        const unit = classPackageUnitPrice(draft);
        return (
          <ClassDraftRow
            key={draft.id}
            title={name}
            detail={packageDetails(draft)}
            aside={Number.isFinite(price) && price > 0 ? formatHNL(price) : "Gratis"}
            note={unit != null ? `${formatHNL(unit)} por sesión` : null}
            editLabel={`Editar ${name}`}
            removeLabel={`Quitar ${name}`}
            onEdit={() => onEdit(draft.id)}
            onRemove={() => onRemove(draft.id)}
          />
        );
      })}
    </ClassBuilderSection>
  );
}
