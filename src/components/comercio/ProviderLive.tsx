"use client";

import { createContext, useContext } from "react";
import type { LiveState } from "@/hooks/useProviderRealtime";

const LiveContext = createContext<LiveState>("idle");

export function ProviderLiveProvider({
  state,
  children,
}: {
  state: LiveState;
  children: React.ReactNode;
}) {
  return <LiveContext.Provider value={state}>{children}</LiveContext.Provider>;
}

/** The comercio panel's realtime connection, for pages that poll as a backup. */
export function useProviderLive(): { state: LiveState; live: boolean } {
  const state = useContext(LiveContext);
  return { state, live: state === "open" };
}

/**
 * Says whether the numbers on screen are following the database. Silent
 * while the socket is still being set up, so it never blinks on load.
 */
export function LiveIndicator() {
  const { state } = useProviderLive();
  if (state === "idle") return null;

  const live = state === "open";
  const label = live ? "En vivo" : "Reconectando";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-1.5 text-[12px] font-semibold tracking-tight transition sm:gap-2 sm:px-3 ${
        live
          ? "border-success/25 bg-success/[0.08] text-success"
          : "border-white/10 bg-white/[0.04] text-white/45"
      }`}
      aria-label={label}
      title={
        live
          ? "Las ventas se actualizan solas, sin recargar."
          : "Sin conexión en vivo: los datos se refrescan cada minuto."
      }
    >
      <span className="relative flex size-2">
        {live ? (
          <span
            className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75"
            aria-hidden
          />
        ) : null}
        <span
          className={`relative inline-flex size-2 rounded-full ${
            live ? "bg-success" : "bg-white/30"
          }`}
          aria-hidden
        />
      </span>
      <span className="hidden min-[380px]:inline">{label}</span>
    </span>
  );
}
