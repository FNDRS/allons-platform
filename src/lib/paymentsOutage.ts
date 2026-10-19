import { ApiError } from "@/lib/api/client";

/**
 * Set to true while Clinpays (the card gateway) is down: the site then shows
 * a banner and refuses to start a payment. Flip back to false once Clinpays
 * confirms it is back.
 */
export const PAYMENTS_OUTAGE = false;

export const PAYMENTS_OUTAGE_MESSAGE =
  "Los pagos están pausados mientras se resuelve un problema con la plataforma de pagos. Intenta más tarde.";

/** Rejects like the API would, so every checkout shows its usual error. */
export function paymentsOutageError() {
  return new ApiError(PAYMENTS_OUTAGE_MESSAGE, 503, "payments_outage");
}
