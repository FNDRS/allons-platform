import { apiFetch } from "./client";

/**
 * Trades the token in an invite mail for a Supabase recovery token, redeemed
 * right away with `verifyOtp`. Single use, so call it only on a tap.
 */
export function redeemAuthInvite(token: string) {
  return apiFetch<{ tokenHash: string; type: "recovery" }>("/auth-invites/redeem", {
    method: "POST",
    body: { token },
    auth: false,
  });
}
