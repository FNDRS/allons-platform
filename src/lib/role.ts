import type { User } from "@supabase/supabase-js";

/**
 * Same JWT rule the app uses: comercio UI only when metadata.role is
 * provider. Missing role is a client. Disabled members stay out.
 */
export function isComercioUser(user: User | null | undefined): boolean {
  if (!user) return false;
  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  if (meta.comercio_member_active === false) return false;
  return meta.role === "provider";
}
