import type { ReactNode } from "react";

/** Ícono naranja sobre una pieza negra con relieve: degradado, brillo arriba y sombra. */
export function IconTile({ children }: { children: ReactNode }) {
  return (
    <span className="relative flex size-11 shrink-0 items-center justify-center rounded-[13px] bg-gradient-to-b from-[#232326] to-[#0b0b0c] text-accent shadow-[0_8px_20px_-6px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.12)] ring-1 ring-white/10">
      {children}
    </span>
  );
}
