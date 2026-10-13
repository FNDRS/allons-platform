import type { ClassCancellationPolicy } from "@/lib/api/classPrograms";

export interface ClassCancellationInput {
  /** Program policy. Null while the program is still loading. */
  policy?: ClassCancellationPolicy | null;
  /** Hours before the session up to which the credit still comes back. */
  windowHours?: number | null;
  startsAt?: Date | null;
  /** False when no credit could come back at all (unlimited pass, no pass). */
  refundableCredit?: boolean;
}

export interface ClassCancellationCopy {
  title: string;
  body: string;
  confirmLabel: string;
}

const CANCEL_TITLE = "Cancelar reserva";
/** True in every branch: the spot is freed whatever happens to the credit. */
const SPOT_FREED = "Tu cupo se liberará y ya no podrás usar el QR de esta clase.";

function hoursLabel(hours: number) {
  return hours === 1 ? "1 hora" : `${hours} horas`;
}

/**
 * What to tell someone about to cancel a class reservation. The policy says
 * whether the credit comes back, the window says until when. Best effort:
 * the API recomputes the window and its answer is what the buyer is told
 * after cancelling.
 */
export function describeClassCancellation(
  input: ClassCancellationInput,
): ClassCancellationCopy {
  if (input.refundableCredit === false) {
    return {
      title: CANCEL_TITLE,
      body: `Esta reserva no descontó ninguna sesión de tu paquete, así que no hay crédito que devolver. ${SPOT_FREED}`,
      confirmLabel: "Cancelar reserva",
    };
  }

  // Unknown policy: promise nothing rather than a credit that may not come.
  if (!input.policy) {
    return {
      title: CANCEL_TITLE,
      body: `${SPOT_FREED} El crédito que corresponda según la política del comercio se resuelve al cancelar.`,
      confirmLabel: "Cancelar de todas formas",
    };
  }

  if (input.policy === "none") {
    return {
      title: CANCEL_TITLE,
      body: `El comercio no devuelve el crédito de esta clase, así que perderás la sesión. ${SPOT_FREED}`,
      confirmLabel: "Cancelar sin crédito",
    };
  }

  const windowHours =
    typeof input.windowHours === "number" && input.windowHours >= 0
      ? Math.round(input.windowHours)
      : null;
  const startMs = input.startsAt?.getTime();
  const remaining =
    startMs != null && Number.isFinite(startMs) ? (startMs - Date.now()) / 3_600_000 : null;

  if (windowHours == null || remaining == null) {
    return {
      title: CANCEL_TITLE,
      body: `Si cancelas con la anticipación que pide el comercio, el crédito vuelve a tu paquete. ${SPOT_FREED}`,
      confirmLabel: "Cancelar reserva",
    };
  }

  if (remaining <= 0 || remaining < windowHours) {
    return {
      title: CANCEL_TITLE,
      body:
        windowHours === 0
          ? `La clase ya empezó, así que perderás la sesión. ${SPOT_FREED}`
          : `El plazo para recuperar el crédito era hasta ${hoursLabel(windowHours)} antes de la clase y ya pasó, así que perderás la sesión. ${SPOT_FREED}`,
      confirmLabel: "Cancelar sin crédito",
    };
  }

  return {
    title: CANCEL_TITLE,
    body:
      windowHours === 0
        ? `Te devolvemos el crédito a tu paquete: el comercio lo permite hasta que la clase empiece. ${SPOT_FREED}`
        : `Te devolvemos el crédito a tu paquete: estás dentro del plazo de ${hoursLabel(windowHours)} antes de la clase. ${SPOT_FREED}`,
    confirmLabel: "Cancelar y recuperar crédito",
  };
}
