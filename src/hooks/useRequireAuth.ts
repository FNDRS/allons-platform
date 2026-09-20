"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/components/app/AuthProvider";

/** Sends a guest to /login and back here afterwards. */
export function useRequireAuth() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading || user) return;
    const next =
      typeof window !== "undefined"
        ? window.location.pathname + window.location.search
        : pathname;
    router.replace(`/login?next=${encodeURIComponent(next)}`);
  }, [loading, user, router, pathname]);

  return { user, loading, ready: !loading && Boolean(user) };
}
