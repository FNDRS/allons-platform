"use client";

import { createContext, useContext, useEffect, type ReactNode } from "react";
import { useStairsPreload } from "@/hooks/useStairsPreload";
import { useEventsQuery } from "@/hooks/useEvents";
import { StairsPreloader } from "@/components/ui/StairsPreloader";

const StairsCoverContext = createContext(false);

/** White stairs sit on top of the shell, including the nav, from the first paint. */
export function StairsCoverProvider({ children }: { children: ReactNode }) {
  const events = useEventsQuery();
  useEffect(() => {
    if (!events.data) return;
    for (const event of events.data) {
      if (!event.coverImageUrl) continue;
      const img = new Image();
      img.decoding = "async";
      img.src = event.coverImageUrl;
    }
  }, [events.data]);
  const show = useStairsPreload(!events.isPending);
  return (
    <StairsCoverContext.Provider value={show}>
      {children}
      <StairsPreloader show={show} label="Cargando eventos" />
    </StairsCoverContext.Provider>
  );
}

export function useStairsCovering() {
  return useContext(StairsCoverContext);
}
