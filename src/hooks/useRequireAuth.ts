"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/components/app/AuthProvider";

/** Sends a guest to /login and back here afterwards. */
export function useRequireAuth(options?: { enabled?: boolean }) {
  const enabled = options?.enabled ?? true;
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!enabled || loading || user) return;
    const next =
      typeof window !== "undefined"
        ? window.location.pathname + window.location.search
        : pathname;
    router.replace(`/login?next=${encodeURIComponent(next)}`);
  }, [enabled, loading, user, router, pathname]);

  return {
    user,
    loading,
    ready: !enabled || (!loading && Boolean(user)),
  };
}
