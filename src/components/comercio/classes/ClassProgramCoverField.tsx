import { Card } from "@/components/ui/Card";
import { FileDrop } from "@/components/ui/FileDrop";
import { uploadClassCover } from "@/lib/api/classCoverUpload";
import { ClassFormField } from "./ClassFormField";

/** One cover image, uploaded as soon as it is dropped. */
export function ClassProgramCoverField({
  url,
  onChange,
  onBusyChange,
}: {
  url: string | null;
  onChange: (url: string | null) => void;
  onBusyChange: (busy: boolean) => void;
}) {
  return (
    <Card>
      <ClassFormField label="Imagen de portada">
        <FileDrop
          files={url ? [{ url, name: "Portada" }] : []}
          onChange={(files) => onChange(files[0]?.url ?? null)}
          upload={uploadClassCover}
          onBusyChange={onBusyChange}
          max={1}
          title="Arrastra la portada aquí"
        />
      </ClassFormField>
    </Card>
  );
}
