"use client";

import { useCallback, useEffect, useRef } from "react";

/** Site key for the invisible anti-bot check on the guest checkout. Unset: no check. */
export const TURNSTILE_SITE_KEY =
  process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() || null;

const SCRIPT_SRC =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
const TOKEN_TIMEOUT_MS = 20_000;

interface TurnstileApi {
  render: (
    container: HTMLElement,
    options: {
      sitekey: string;
      execution?: "render" | "execute";
      appearance?: "always" | "execute" | "interaction-only";
      callback?: (token: string) => void;
      "error-callback"?: (code?: string) => void;
      "expired-callback"?: () => void;
    },
  ) => string;
  execute: (widgetId: string) => void;
  reset: (widgetId: string) => void;
  remove: (widgetId: string) => void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

let scriptLoading: Promise<TurnstileApi> | null = null;

function loadTurnstile(): Promise<TurnstileApi> {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (scriptLoading) return scriptLoading;
  scriptLoading = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = () => {
      if (window.turnstile) resolve(window.turnstile);
      else reject(new Error("Turnstile no cargó"));
    };
    script.onerror = () => {
      // A blocked or flaky load must not poison every later attempt.
      scriptLoading = null;
      script.remove();
      reject(new Error("No pudimos cargar la verificación. Recarga la página e intenta de nuevo."));
    };
    document.head.appendChild(script);
  });
  return scriptLoading;
}

/**
 * Cloudflare Turnstile, invisible: the buyer sees nothing unless Cloudflare
 * is unsure, in which case a small box asks for one click. `getToken` runs
 * the check and resolves with a one-use token for the API; null when the
 * site key is not configured (local runs), so callers simply omit it.
 */
export function useTurnstile() {
  const container = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const pending = useRef<{
    resolve: (token: string) => void;
    reject: (err: Error) => void;
  } | null>(null);

  useEffect(
    () => () => {
      if (widgetId.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetId.current);
        } catch {
          /* already gone */
        }
      }
      widgetId.current = null;
    },
    [],
  );

  const getToken = useCallback(async (): Promise<string | null> => {
    if (!TURNSTILE_SITE_KEY) return null;
    const api = await loadTurnstile();
    if (!container.current) throw new Error("Turnstile sin contenedor");
    if (!widgetId.current) {
      widgetId.current = api.render(container.current, {
        sitekey: TURNSTILE_SITE_KEY,
        execution: "execute",
        appearance: "interaction-only",
        callback: (token) => {
          pending.current?.resolve(token);
          pending.current = null;
        },
        "error-callback": () => {
          pending.current?.reject(
            new Error("No pudimos verificar la solicitud. Recarga la página e intenta de nuevo."),
          );
          pending.current = null;
        },
        "expired-callback": () => {
          // The challenge timed out while the buyer was on it: say so now
          // rather than leaving the button spinning until our own timeout.
          pending.current?.reject(
            new Error("La verificación venció. Pulsa pagar de nuevo."),
          );
          pending.current = null;
        },
      });
    } else {
      api.reset(widgetId.current);
    }
    const id = widgetId.current;
    return new Promise<string>((resolve, reject) => {
      const timer = window.setTimeout(() => {
        pending.current = null;
        reject(new Error("La verificación tardó demasiado. Intenta de nuevo."));
      }, TOKEN_TIMEOUT_MS);
      pending.current = {
        resolve: (token) => {
          window.clearTimeout(timer);
          resolve(token);
        },
        reject: (err) => {
          window.clearTimeout(timer);
          reject(err);
        },
      };
      api.execute(id);
    });
  }, []);

  return { container, getToken, enabled: Boolean(TURNSTILE_SITE_KEY) };
}
