"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

/** Where the buyer was headed when the guard stepped in. */
type Pending = { kind: "back" } | { kind: "href"; href: string };

/** Anchors with this attribute leave without asking (resuming the same order). */
export const ALLOW_LEAVE_ATTR = "data-allow-leave";

/**
 * Asks before the buyer leaves a checkout they have started. Two levels:
 *
 * `armed` catches any link on the page (the nav, "Volver al evento", the
 * footer) with our own modal through `pending`. A held ticket is enough
 * for this: the buyer may not have typed anything yet, but the clock on
 * their entry is running.
 *
 * `unsaved` also traps the browser's back button and asks on closing or
 * reloading the tab (the native prompt is all a tab close can get). Only
 * while something typed would really be lost: a reload with nothing typed
 * restores the ticket and the draft on its own, and a back-button trap on
 * every landing loops a buyer who merely mis-tapped Reservar.
 *
 * `release()` stands down for a navigation the checkout itself makes (the
 * order was placed, Google sign-in), so those never ask.
 */
export function useLeaveGuard({
  armed,
  unsaved = armed,
  fallbackHref,
}: {
  armed: boolean;
  /** Something typed that a reload would lose. Defaults to `armed`. */
  unsaved?: boolean;
  /** Where "leave" goes when there is no page to go back to. */
  fallbackHref: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState<Pending | null>(null);
  const released = useRef(false);
  const trapped = useRef(false);

  useEffect(() => {
    if (!armed || !unsaved) return;
    released.current = false;

    // One extra history entry under the checkout: the back button lands on
    // it, which fires popstate here instead of leaving, and the modal asks.
    if (!trapped.current) {
      window.history.pushState({ allonsLeaveGuard: true }, "", window.location.href);
      trapped.current = true;
    }
    const onPop = () => {
      if (released.current) return;
      window.history.pushState({ allonsLeaveGuard: true }, "", window.location.href);
      setPending({ kind: "back" });
    };
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (released.current) return;
      event.preventDefault();
      // Older browsers read this; modern ones show their own text.
      event.returnValue = "";
    };
    window.addEventListener("popstate", onPop);
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => {
      window.removeEventListener("popstate", onPop);
      window.removeEventListener("beforeunload", onBeforeUnload);
    };
  }, [armed, unsaved]);

  useEffect(() => {
    if (!armed) return;
    released.current = false;

    // Capture phase on the document runs before React's own handlers, so
    // the Link never navigates; the modal does, if the buyer confirms.
    const onClick = (event: MouseEvent) => {
      if (released.current || event.defaultPrevented) return;
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = (event.target as Element | null)?.closest?.("a[href]");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (anchor.hasAttribute(ALLOW_LEAVE_ATTR)) return;
      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download")) return;
      let url: URL;
      try {
        url = new URL(anchor.href, window.location.href);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && url.search === window.location.search) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      setPending({ kind: "href", href: url.pathname + url.search + url.hash });
    };

    document.addEventListener("click", onClick, true);
    return () => {
      document.removeEventListener("click", onClick, true);
    };
  }, [armed]);

  const stay = useCallback(() => setPending(null), []);

  const leave = useCallback(() => {
    const target = pending;
    released.current = true;
    setPending(null);
    if (!target) return;
    if (target.kind === "href") {
      // Over our own trap entry when there is one, so the page they go to
      // sits on a single checkout entry and one Back brings them here.
      if (trapped.current) {
        trapped.current = false;
        router.replace(target.href);
      } else {
        router.push(target.href);
      }
      return;
    }
    // The back button almost always means "the event page", which is also
    // what a tab that opened straight on the checkout needs. Going there by
    // route is predictable; walking the history over our own entry was not.
    router.replace(fallbackHref);
  }, [pending, router, fallbackHref]);

  /** The checkout is moving on by itself: do not ask. */
  const release = useCallback(() => {
    released.current = true;
    setPending(null);
  }, []);

  return {
    pending: pending !== null,
    /** The link that was clicked, when the guard stepped in on one. */
    pendingHref: pending?.kind === "href" ? pending.href : null,
    stay,
    leave,
    release,
  };
}
