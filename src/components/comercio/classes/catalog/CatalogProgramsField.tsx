import { Chip } from "@/components/ui/Pill";
import { Segmented } from "@/components/ui/Segmented";
import { ClassFormField } from "../ClassFormField";

type Scope = "all" | "some";

/** Whether it sells every program of the comercio or only the chosen ones. */
export function CatalogProgramsField({
  programs,
  allPrograms,
  selectedIds,
  onAllProgramsChange,
  onToggle,
}: {
  programs: { id: string; title: string }[];
  allPrograms: boolean;
  selectedIds: string[];
  onAllProgramsChange: (all: boolean) => void;
  onToggle: (id: string) => void;
}) {
  return (
    <ClassFormField
      label="Programas"
      hint={allPrograms ? "También cubre los programas que crees después." : undefined}
    >
      <div className="flex flex-col gap-3">
        <Segmented<Scope>
          label="Programas que cubre"
          value={allPrograms ? "all" : "some"}
          options={[
            { value: "all", label: "Todos" },
            { value: "some", label: "Elegir programas" },
          ]}
          onChange={(scope) => onAllProgramsChange(scope === "all")}
        />
        {allPrograms ? null : programs.length === 0 ? (
          <p className="text-[13px] text-white/50">Aún no tienes programas.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {programs.map((program) => (
              <Chip
                key={program.id}
                active={selectedIds.includes(program.id)}
                onClick={() => onToggle(program.id)}
              >
                {program.title}
              </Chip>
            ))}
          </div>
        )}
      </div>
    </ClassFormField>
  );
}
