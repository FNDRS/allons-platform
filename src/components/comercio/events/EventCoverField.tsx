import { Card } from "@/components/ui/Card";
import { FileDrop } from "@/components/ui/FileDrop";
import { ClassFormField } from "@/components/comercio/classes/ClassFormField";
import { uploadClassCover } from "@/lib/api/classCoverUpload";

/** The event's cover, uploaded to the same bucket the app uses as soon as it drops. */
export function EventCoverField({
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
      <ClassFormField
        label="Imagen de portada"
        hint="Es lo primero que ve la gente en la app y en la web."
      >
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
