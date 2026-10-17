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
 * Who can create and edit events: the comercio's owner and its admins, the
 * same roles the API accepts on the event routes. Finance staff only read.
 */
export function canManageEvents(user: User | null | undefined): boolean {
  if (!isComercioUser(user)) return false;
  const meta = (user?.user_metadata ?? {}) as Record<string, unknown>;
  if (meta.role === "provider") return true;
  return (
    meta.comercio_role === "admin" ||
    meta.comercio_role === "comercio" ||
    meta.staff_role === "admin" ||
    meta.staff_role === "comercio"
  );
}
