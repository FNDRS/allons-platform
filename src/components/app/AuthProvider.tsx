"use client";

import type { Session, User } from "@supabase/supabase-js";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getSupabaseBrowser } from "@/lib/supabase-browser";

interface AuthState {
  session: Session | null;
  user: User | null;
  /** True until the first session read finishes. */
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // A password-recovery link can land on any page when Supabase falls back
    // to the project's site URL (a reset sent from its dashboard does). Only
    // /login knows how to ask for the new password, so hand it the hash
    // before the client here consumes it and drops the user into the app
    // with the old password still set.
    if (
      window.location.hash.includes("type=recovery") &&
      window.location.pathname !== "/login"
    ) {
      window.location.replace(`/login${window.location.hash}`);
      return;
    }
    let active = true;
    let supabase: ReturnType<typeof getSupabaseBrowser>;
    try {
      supabase = getSupabaseBrowser();
    } catch {
      setLoading(false);
      return;
    }
    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!active) return;
        setSession(data.session);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signOut = useCallback(async () => {
    // Local only: the default scope is global and would also end this
    // account's sessions in admin and the mobile app.
    await getSupabaseBrowser().auth.signOut({ scope: "local" });
    setSession(null);
  }, []);

  const value = useMemo<AuthState>(
    () => ({ session, user: session?.user ?? null, loading, signOut }),
    [session, loading, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth needs AuthProvider");
  return ctx;
}

function metadataString(meta: Record<string, unknown>, key: string) {
  const value = meta[key];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

/** Display name from Supabase metadata, falling back to the email prefix. */
export function displayNameOf(user: User | null): string {
  if (!user) return "";
  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  const name =
    metadataString(meta, "full_name") ?? metadataString(meta, "name") ?? "";
  if (name) return name;
  return user.email?.split("@")[0] ?? "";
}

/**
 * Instant photo from the session (Google picture / stored avatar_url).
 * /me still wins once it returns, because that is the Pixabot source.
 */
export function avatarUrlOf(user: User | null): string | null {
  if (!user) return null;
  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  return metadataString(meta, "avatar_url") ?? metadataString(meta, "picture");
}
