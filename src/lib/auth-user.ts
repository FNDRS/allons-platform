import type { User } from "@supabase/supabase-js";

/** Sign-in providers on the account: "email", "google", "apple". */
export function providersOf(user: User | null | undefined): string[] {
  const list = user?.app_metadata?.providers as unknown;
  return Array.isArray(list) ? list.filter((p): p is string => typeof p === "string") : [];
}

/**
 * Whether to ask, once, if they want a password after entering with a code.
 * Supabase does not say whether an account has one, so the account carries
 * the answer: `passwordOffered` is stamped wherever a password is chosen
 * (sign-up, recovery, the account page) and when the offer is answered.
 * Google and Apple accounts never get it: they already have a way in that
 * does not wait for a code. An invited account that still has to set its
 * password (`mustSetPassword`) goes to the mandatory form instead.
 */
export function shouldOfferPassword(user: User | null | undefined): boolean {
  if (!user) return false;
  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  if (meta.passwordOffered === true) return false;
  if (meta.mustSetPassword === false || meta.mustSetPassword === true) return false;
  return !providersOf(user).some((p) => p === "google" || p === "apple");
}
