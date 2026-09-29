import type { User } from "@supabase/supabase-js";

/**
 * Same JWT rule the app uses: comercio UI opens for provider accounts and
 * invited staff with dashboard-capable roles. Scanner-only staff and clients
 * stay out. Disabled members stay out.
 */
export function isComercioUser(user: User | null | undefined): boolean {
  if (!user) return false;
  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  if (meta.comercio_member_active === false) return false;
  if (meta.role === "provider") return true;
  if (meta.role !== "staff") return false;

  const comercioRole = meta.comercio_role;
  if (comercioRole === "admin" || comercioRole === "comercio") return true;

  const staffRole = meta.staff_role;
  return (
    staffRole === "admin" ||
    staffRole === "comercio" ||
    staffRole === "finance"
  );
}

/**
 * A Hub comercio (e.g. la Semana del Emprendimiento) reads straight from the
 * JWT, no extra request: same field the seed sets via `comercio_kind`.
 */
export function isHubUser(user: User | null | undefined): boolean {
  if (!user) return false;
  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  return meta.comercio_kind === "hub";
}
