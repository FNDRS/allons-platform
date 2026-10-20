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
    // `/` redirects to `/eventos` with its query string, so the return
    // from Supabase (a Google sign-in, a recovery or confirmation link that
    // fell back to the Site URL, or its error) lands on either.
    if (sent.current || (pathname !== "/" && pathname !== "/eventos")) return;
    const params = new URLSearchParams(window.location.search);
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    if (params.get("error") || params.get("error_code") || hash.get("error_code")) {
      sent.current = true;
      // The login page reads the code and says what happened (an expired
      // link, say) instead of leaving the error on the events list.
      const code = params.get("error_code") ?? hash.get("error_code");
      const description =
        params.get("error_description") ?? hash.get("error_description");
      const query = new URLSearchParams({ oauth_error: "1" });
      if (code) query.set("error_code", code);
      if (description) query.set("error_description", description);
      router.replace(`/login?${query.toString()}`);
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
