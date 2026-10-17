import { Input } from "@/components/ui/Field";
import { SwitchRow } from "@/components/ui/SwitchRow";
import { ClassFormField } from "@/components/comercio/classes/ClassFormField";
import type { EventTicketDraft } from "@/hooks/event-form/useEventTicketsForm";

/** Lets a buyer pay more than the price as a contribution, as in the admin. */
export function EventTicketDonationFields({
  draft,
  onChange,
}: {
  draft: EventTicketDraft;
  onChange: (patch: Partial<EventTicketDraft>) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <SwitchRow
        label="Permitir donación al comprar"
        hint="Quien compra esta entrada puede sumar un aporte al pagar."
        checked={draft.donationEnabled}
        onChange={(donationEnabled) => onChange({ donationEnabled })}
      />
      {draft.donationEnabled ? (
        <ClassFormField
          label="Donación sugerida (HNL, opcional)"
          hint="Se ofrece como botón al pagar. Déjala vacía si no quieres sugerir un monto."
        >
          {(id) => (
            <Input
              id={id}
              inputMode="decimal"
              placeholder="100"
              value={draft.suggestedDonation}
              maxLength={9}
              onChange={(e) =>
                onChange({ suggestedDonation: e.target.value.replace(/[^0-9.]/g, "") })
              }
            />
          )}
        </ClassFormField>
      ) : null}
    </div>
  );
}
