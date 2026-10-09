"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";

/**
 * Deletes a saved card in two taps: the first arms it, the second removes.
 * Sits beside the card row, never inside it, because the row is a radio
 * button and a button cannot hold another.
 */
export function RemoveCardButton({
  last4,
  removing,
  disabled,
  onRemove,
}: {
  last4: string | null;
  removing: boolean;
  disabled?: boolean;
  onRemove: () => void;
}) {
  const [armed, setArmed] = useState(false);
  const label = `Eliminar tarjeta terminada en ${last4 ?? "????"}`;

  if (armed || removing) {
    return (
      <div className="flex shrink-0 items-center gap-1.5">
        <button
          type="button"
          disabled={disabled || removing}
          onClick={onRemove}
          className="rounded-full bg-red-500/15 px-3 py-2 text-[12px] font-semibold text-red-300 ring-1 ring-red-400/30 transition hover:bg-red-500/25 disabled:opacity-50"
        >
          {removing ? "Eliminando…" : "Eliminar"}
        </button>
        {removing ? null : (
          <button
            type="button"
            onClick={() => setArmed(false)}
            className="rounded-full px-2.5 py-2 text-[12px] font-semibold text-white/45 transition hover:text-white"
          >
            Cancelar
          </button>
        )}
      </div>
    );
  }

  return (
    <button
      type="button"
      aria-label={label}
      title="Eliminar tarjeta"
      disabled={disabled}
      onClick={() => setArmed(true)}
      className="flex size-10 shrink-0 items-center justify-center rounded-full text-white/35 ring-1 ring-white/10 transition hover:bg-white/5 hover:text-red-300 disabled:opacity-40"
    >
      <Trash2 className="size-4" strokeWidth={1.75} aria-hidden />
    </button>
  );
}
