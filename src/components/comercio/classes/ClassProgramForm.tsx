"use client";

import { useClassProgramForm } from "@/hooks/useClassProgramForm";
import type { ProviderClassProgram } from "@/lib/api/providerClassPrograms";
import { ClassPackageEditorModal } from "./ClassPackageEditorModal";
import { ClassProgramBasicsFields } from "./ClassProgramBasicsFields";
import { ClassProgramCoverField } from "./ClassProgramCoverField";
import { ClassProgramFormActions } from "./ClassProgramFormActions";
import { ClassProgramLocationFields } from "./ClassProgramLocationFields";
import { ClassProgramPackageBuilder } from "./ClassProgramPackageBuilder";
import { ClassProgramScheduleBuilder } from "./ClassProgramScheduleBuilder";
import { ClassScheduleEditorModal } from "./ClassScheduleEditorModal";

/**
 * The form itself. `useClassProgramForm` seeds its state from `program` on
 * mount, so the editor resolves the program first and only then mounts this.
 */
export function ClassProgramForm({ program }: { program: ProviderClassProgram | null }) {
  const f = useClassProgramForm(program);

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <ClassProgramBasicsFields {...f} />
      <ClassProgramLocationFields {...f} />
      <ClassProgramCoverField
        url={f.coverImageUrl}
        onChange={f.setCoverImageUrl}
        onBusyChange={f.setCoverBusy}
      />
      <ClassProgramScheduleBuilder
        schedules={f.schedule.schedules}
        coaches={f.coaches}
        onAdd={f.schedule.openNew}
        onEdit={f.schedule.openExisting}
        onRemove={f.schedule.remove}
      />
      <ClassProgramPackageBuilder
        packages={f.packages.packages}
        catalogPackageCount={f.catalogPackageCount}
        onAdd={f.packages.openNew}
        onEdit={f.packages.openExisting}
        onRemove={f.packages.remove}
      />
      <ClassProgramFormActions
        canSaveDraft={f.canSaveDraft}
        canPublish={f.canPublish}
        missingForPublish={f.missingForPublish}
        savingTarget={f.savingTarget}
        cancelHref={f.cancelHref}
        onSave={f.save}
      />

      <ClassScheduleEditorModal
        draft={f.schedule.editorDraft}
        error={f.schedule.editorError}
        coaches={f.coaches}
        onChange={f.schedule.updateEditor}
        onCancel={f.schedule.closeEditor}
        onConfirm={f.schedule.commitEditor}
      />
      <ClassPackageEditorModal
        draft={f.packages.editorDraft}
        error={f.packages.editorError}
        onChange={f.packages.updateEditor}
        onCancel={f.packages.closeEditor}
        onConfirm={f.packages.commitEditor}
      />
    </div>
  );
}
