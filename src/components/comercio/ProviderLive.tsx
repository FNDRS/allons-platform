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
