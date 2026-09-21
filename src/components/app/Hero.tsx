"use client";

import { displayNameOf, useAuth } from "./AuthProvider";

function firstName(full: string) {
  return full.trim().split(/\s+/)[0] ?? "";
}

/**
 * The greeting block at the top of the customer pages: a big two line
 * headline that names the person when signed in, and an optional slot
 * for the search pill.
 */
export function Hero({
  signedInTitle,
  guestTitle,
  body,
  children,
}: {
  /** Receives the first name; return the headline. */
  signedInTitle: (name: string) => React.ReactNode;
  guestTitle: React.ReactNode;
  body?: React.ReactNode;
  children?: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const name = user ? firstName(displayNameOf(user)) : "";
  return (
    <section className="mb-8 flex flex-col gap-6">
      <div>
        <h1 className="text-[36px] font-bold leading-[1.02] tracking-[-0.03em] sm:text-[52px]">
          {loading ? (
            <span className="inline-block h-[1em] w-64 rounded-xl bg-surface-2" aria-hidden />
          ) : user && name ? (
            signedInTitle(name)
          ) : (
            guestTitle
          )}
        </h1>
        {body ? <p className="mt-3 max-w-lg text-[15px] text-muted sm:text-base">{body}</p> : null}
      </div>
      {children}
    </section>
  );
}
