import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Field";
import { Segmented } from "@/components/ui/Segmented";
import { SwitchRow } from "@/components/ui/SwitchRow";
import { ClassFormField } from "@/components/comercio/classes/ClassFormField";
import type { RefundPolicy, useEventForm } from "@/hooks/useEventForm";

const REFUND_OPTIONS: { value: RefundPolicy; label: string }[] = [
  { value: "none", label: "Sin reembolso" },
  { value: "partial", label: "Parcial" },
  { value: "full", label: "Completo" },
];

type Props = Pick<
  ReturnType<typeof useEventForm>,
  | "capacity"
  | "setCapacity"
  | "capacityFromTickets"
  | "hasPaidTickets"
  | "refundPolicy"
  | "setRefundPolicy"
  | "refundPartialPct"
  | "setRefundPartialPct"
  | "refundDeadlineDays"
  | "setRefundDeadlineDays"
  | "minAge"
  | "setMinAge"
  | "smokingAllowed"
  | "setSmokingAllowed"
  | "petFriendly"
  | "setPetFriendly"
  | "parkingAvailable"
  | "setParkingAvailable"
>;

/** Capacity, refunds, age and the practical details attendees ask about. */
export function EventPolicyFields(p: Props) {
  return (
    <Card className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <ClassFormField
          label="Capacidad"
          hint={
            p.capacityFromTickets > 0
              ? `Si la dejas vacía usamos el total de entradas (${p.capacityFromTickets}).`
              : "Cuántas personas caben en total."
          }
        >
          {(id) => (
            <Input
              id={id}
              inputMode="numeric"
              placeholder={p.capacityFromTickets > 0 ? String(p.capacityFromTickets) : "200"}
              value={p.capacity}
              onChange={(e) => p.setCapacity(e.target.value)}
            />
          )}
        </ClassFormField>
        <ClassFormField label="Edad mínima (opcional)">
          {(id) => (
            <Input
              id={id}
              inputMode="numeric"
              placeholder="18"
              value={p.minAge}
              onChange={(e) => p.setMinAge(e.target.value)}
            />
          )}
        </ClassFormField>
      </div>

      {p.hasPaidTickets ? (
        <ClassFormField label="Reembolsos">
          <div className="flex flex-col gap-3">
            <Segmented
              label="Política de reembolso"
              value={p.refundPolicy}
              options={REFUND_OPTIONS}
              onChange={p.setRefundPolicy}
            />
            {p.refundPolicy !== "none" ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {p.refundPolicy === "partial" ? (
                  <ClassFormField label="Porcentaje que devuelves">
                    {(id) => (
                      <Input
                        id={id}
                        inputMode="numeric"
                        placeholder="50"
                        value={p.refundPartialPct}
                        onChange={(e) => p.setRefundPartialPct(e.target.value)}
                      />
                    )}
                  </ClassFormField>
                ) : null}
                <ClassFormField
                  label="Días antes del evento"
                  hint="Hasta cuántos días antes se puede pedir."
                >
                  {(id) => (
                    <Input
                      id={id}
                      inputMode="numeric"
                      placeholder="2"
                      value={p.refundDeadlineDays}
                      onChange={(e) => p.setRefundDeadlineDays(e.target.value)}
                    />
                  )}
                </ClassFormField>
              </div>
            ) : null}
          </div>
        </ClassFormField>
      ) : null}

      <ClassFormField label="Detalles">
        <div className="flex flex-col gap-2">
          <SwitchRow label="Se permite fumar" checked={p.smokingAllowed} onChange={p.setSmokingAllowed} />
          <SwitchRow label="Pet friendly" checked={p.petFriendly} onChange={p.setPetFriendly} />
          <SwitchRow label="Con parqueo" checked={p.parkingAvailable} onChange={p.setParkingAvailable} />
        </div>
      </ClassFormField>
    </Card>
  );
}
