import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Field";
import { Segmented } from "@/components/ui/Segmented";
import type { ClassCancellationPolicy } from "@/lib/api/providerClassPrograms";
import { ClassFormField } from "./ClassFormField";

const POLICY_OPTIONS: { value: ClassCancellationPolicy; label: string }[] = [
  { value: "credit", label: "Devolver sesión" },
  { value: "none", label: "Sin devolución" },
];

function windowHint(hours: string) {
  if (hours === "0") {
    return "La sesión vuelve al paquete de tu cliente mientras la clase no haya empezado.";
  }
  return `La sesión vuelve al paquete de tu cliente si cancela con ${hours || "-"} h o más de anticipación. Después de eso, la pierde.`;
}

/**
 * What cancelling a reservation does with the session. Only the credit
 * moves, never money: the package was paid up front, and the hours are the
 * deadline for the session to go back to the client's balance.
 */
export function ClassProgramCancellationFields({
  policy,
  onChangePolicy,
  windowHours,
  onChangeWindowHours,
}: {
  policy: ClassCancellationPolicy;
  onChangePolicy: (policy: ClassCancellationPolicy) => void;
  windowHours: string;
  onChangeWindowHours: (value: string) => void;
}) {
  return (
    <Card className="flex flex-col gap-4">
      <ClassFormField label="Cancelación">
        <p className="mb-3 text-[13px] text-white/50">
          Qué pasa con la sesión cuando un cliente cancela su reserva. El cupo se libera siempre.
        </p>
        <Segmented
          label="Política de cancelación"
          tone="gray"
          value={policy}
          options={POLICY_OPTIONS}
          onChange={onChangePolicy}
        />
      </ClassFormField>
      {policy === "credit" ? (
        <ClassFormField label="Plazo (horas antes de la clase)" hint={windowHint(windowHours)}>
          <Input
            inputMode="numeric"
            placeholder="6"
            maxLength={3}
            value={windowHours}
            onChange={(e) => onChangeWindowHours(e.target.value)}
            className="sm:max-w-40"
          />
        </ClassFormField>
      ) : (
        <p className="text-[12px] leading-5 text-dim">
          Tu cliente pierde la sesión al cancelar, sin importar con cuánta anticipación lo haga.
        </p>
      )}
    </Card>
  );
}
