import type { ReactNode } from "react";

/** Ícono sobre una pieza naranja con relieve: degradado, brillo arriba y halo. */
export function IconTile({ children }: { children: ReactNode }) {
  return (
    <span className="relative flex size-11 shrink-0 items-center justify-center rounded-[13px] bg-gradient-to-b from-accent to-accent-deep text-black shadow-[0_8px_24px_-6px_rgba(246,112,16,0.55),inset_0_1px_0_rgba(255,255,255,0.35)] ring-1 ring-white/10">
      {children}
    </span>
  );
}
