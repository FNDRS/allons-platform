import { ApiError } from "@/lib/api/client";

/**
 * Clinpays (the card gateway) is down, so every charge fails or ends up
 * unconfirmed. While true the site shows a banner and refuses to start a
 * payment. Flip to false once Clinpays confirms it is back.
 */
export const PAYMENTS_OUTAGE = true;

export const PAYMENTS_OUTAGE_MESSAGE =
  "Los pagos están pausados mientras se resuelve un problema con la plataforma de pagos. Intenta más tarde.";

/** Rejects like the API would, so every checkout shows its usual error. */
export function paymentsOutageError() {
  return new ApiError(PAYMENTS_OUTAGE_MESSAGE, 503, "payments_outage");
}
