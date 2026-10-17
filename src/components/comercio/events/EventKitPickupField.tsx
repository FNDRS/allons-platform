import { Card } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Field";
import { SwitchRow } from "@/components/ui/SwitchRow";
import { ClassFormField } from "@/components/comercio/classes/ClassFormField";
import type { useEventForm } from "@/hooks/useEventForm";

const MAX_KIT_PICKUP = 2000;

type Props = Pick<
  ReturnType<typeof useEventForm>,
  "kitPickupEnabled" | "setKitPickupEnabled" | "kitPickupInfo" | "setKitPickupInfo"
>;

/**
 * Where and when attendees collect the event's kit. Free text on purpose,
 * as in the admin: each organizer says it their own way. Off clears it.
 */
export function EventKitPickupField(p: Props) {
  return (
    <Card className="flex flex-col gap-4">
      <SwitchRow
        label="Configurar retiro de kit"
        hint="Para carreras y eventos que entregan algo antes: camiseta, número, credencial."
        checked={p.kitPickupEnabled}
        onChange={p.setKitPickupEnabled}
      />
      {p.kitPickupEnabled ? (
        <ClassFormField
          label="Instrucciones de retiro"
          hint="Aparece en la app, en el evento y en el ticket, y en el correo de confirmación de compra."
        >
          {(id) => (
            <div className="flex flex-col gap-1">
              <Textarea
                id={id}
                placeholder={
                  "Ej. Mall Multiplaza, local 12.\nDel 1 al 3 de octubre, 10:00 a. m. a 7:00 p. m.\nPresenta tu identidad."
                }
                value={p.kitPickupInfo}
                maxLength={MAX_KIT_PICKUP}
                rows={4}
                onChange={(e) => p.setKitPickupInfo(e.target.value)}
              />
              <p className="self-end text-[12px] tabular-nums text-dim">
                {p.kitPickupInfo.length}/{MAX_KIT_PICKUP}
              </p>
            </div>
          )}
        </ClassFormField>
      ) : null}
    </Card>
  );
}
