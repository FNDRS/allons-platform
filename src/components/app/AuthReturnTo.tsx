"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";
import {
  forgetLoginNext,
  homeFor,
  peekLoginNext,
  safeLoginNext,
} from "@/lib/login-next";

/**
 * Google OAuth must return to the Supabase Site URL (`/`). Extra query
 * params on redirectTo are not allow-listed, so the server answers
 * `bad_oauth_state` and dumps the user on the waitlist. Destination after
 * login lives in localStorage instead.
 */
export function AuthReturnTo() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current || pathname !== "/") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("error") || params.get("error_code")) {
      sent.current = true;
      router.replace("/login?oauth_error=1");
      return;
    }
    if (loading || !user) return;
    const saved = peekLoginNext();
    if (!saved) return;
    sent.current = true;
    forgetLoginNext();
    const dest = homeFor(user, safeLoginNext(saved));
    if (dest !== pathname) router.replace(dest);
  }, [loading, user, pathname, router]);

  return null;
}
