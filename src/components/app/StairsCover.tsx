"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useStairsPreload } from "@/hooks/useStairsPreload";
import { StairsPreloader } from "@/components/ui/StairsPreloader";

const StairsCoverContext = createContext<{
  show: boolean;
  setReady: (ready: boolean) => void;
}>({ show: false, setReady: () => {} });

/** White stairs sit on top of the shell, including the nav, from the first paint. */
export function StairsCoverProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const show = useStairsPreload(ready);
  return (
    <StairsCoverContext.Provider value={{ show, setReady }}>
      {children}
      <StairsPreloader show={show} label="Cargando eventos" />
    </StairsCoverContext.Provider>
  );
}

export function useStairsCovering() {
  return useContext(StairsCoverContext).show;
}

/** Call once the listing data is in so the stairs can lift. */
export function useStairsCoverReady(ready: boolean) {
  const { setReady } = useContext(StairsCoverContext);
  useEffect(() => {
    setReady(ready);
  }, [ready, setReady]);
}
