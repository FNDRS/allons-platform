import { ApiError } from "@/lib/api/client";

/**
/**
 * Set `NEXT_PUBLIC_PAYMENTS_OUTAGE=true` while Clinpays (the card gateway) is
 * down: the site then shows a banner and refuses to start a payment. Unset
 * or false, payments run.
 */
export const PAYMENTS_OUTAGE = process.env.NEXT_PUBLIC_PAYMENTS_OUTAGE === "true";

export const PAYMENTS_OUTAGE_MESSAGE =
  "Los pagos están pausados mientras se resuelve un problema con la plataforma de pagos. Intenta más tarde.";

/** Rejects like the API would, so every checkout shows its usual error. */
export function paymentsOutageError() {
  return new ApiError(PAYMENTS_OUTAGE_MESSAGE, 503, "payments_outage");
}
