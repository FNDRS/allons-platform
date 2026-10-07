"use client";

import { useCallback, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Clock } from "lucide-react";
import { useDismiss } from "./useDismiss";

const EASE = [0.32, 0.72, 0, 1] as const;
const HOURS = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES = Array.from({ length: 12 }, (_, i) => i * 5);

type Meridiem = "AM" | "PM";

function split(value: string): { hour: number; minute: number; meridiem: Meridiem } | null {
  const match = /^(\d{2}):(\d{2})$/.exec(value);
  if (!match) return null;
  const h24 = Number(match[1]);
  return {
    hour: h24 % 12 === 0 ? 12 : h24 % 12,
    minute: Number(match[2]),
    meridiem: h24 >= 12 ? "PM" : "AM",
  };
}

function join(hour: number, minute: number, meridiem: Meridiem): string {
  const h24 = (hour % 12) + (meridiem === "PM" ? 12 : 0);
  return `${String(h24).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

export function formatTime12(value: string): string {
  const parts = split(value);
  if (!parts) return "";
  return `${parts.hour}:${String(parts.minute).padStart(2, "0")} ${parts.meridiem === "AM" ? "a. m." : "p. m."}`;
}

/**
 * Hora en 12 horas con columnas de hora, minutos (de 5 en 5) y AM/PM.
 * Guarda `HH:mm` en 24 horas, que es lo que espera la API. Nunca el
 * `<input type="time">` del navegador.
 */
export function TimePicker({
  id,
  value,
  onChange,
  placeholder = "Elige la hora",
  invalid,
  describedBy,
}: {
  id?: string;
  /** `HH:mm` en 24 horas, o vacío. */
  value: string;
  onChange: (time: string) => void;
  placeholder?: string;
  invalid?: boolean;
  describedBy?: string;
}) {
  const reduced = useReducedMotion();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);
  useDismiss(rootRef, open, close);

  // Sin valor, la primera elección parte de las 7:00 p. m., la hora más común.
  const current = split(value) ?? { hour: 7, minute: 0, meridiem: "PM" as Meridiem };
  const pick = (patch: Partial<typeof current>) => {
    const next = { ...current, ...patch };
    onChange(join(next.hour, next.minute, next.meridiem));
  };

  const cell = (selected: boolean) =>
    `flex h-9 w-full items-center justify-center rounded-[10px] text-[13px] tabular-nums transition ${
      selected ? "bg-accent font-bold text-black" : "text-white/75 hover:bg-white/[0.08] hover:text-white"
    }`;

  return (
    <div className="relative" ref={rootRef}>
      <button
        id={id}
        type="button"
        onClick={() => setOpen((open) => !open)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        className={`flex h-12 w-full items-center gap-3 rounded-[14px] border bg-surface-2 px-4 text-left text-[15px] outline-none transition focus-visible:border-accent/60 ${
          invalid ? "border-red-400/50" : open ? "border-white/20 bg-white/[0.08]" : "border-border"
        }`}
      >
        <Clock className="size-4 shrink-0 text-dim" strokeWidth={1.75} aria-hidden />
        <span className={value ? "text-white" : "text-dim"}>
          {value ? formatTime12(value) : placeholder}
        </span>
      </button>
      <AnimatePresence>
        {open ? (
          <motion.div
            role="dialog"
            aria-label="Elegir hora"
            initial={reduced ? false : { opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.22, ease: EASE }}
            className="absolute left-0 z-30 mt-2 w-[min(300px,calc(100vw-2.5rem))] origin-top-left rounded-[20px] border border-white/10 bg-[#141416] p-3 shadow-[0_24px_60px_rgba(0,0,0,0.55)]"
          >
            <div className="grid grid-cols-[1fr_1fr_4.5rem] gap-2">
              <div>
                <p className="mb-1.5 px-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-dim">Hora</p>
                <div className="grid max-h-52 grid-cols-2 gap-1 overflow-y-auto pr-0.5">
                  {HOURS.map((hour) => (
                    <button
                      key={hour}
                      type="button"
                      onClick={() => pick({ hour })}
                      className={cell(value !== "" && current.hour === hour)}
                    >
                      {hour}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-1.5 px-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-dim">Min</p>
                <div className="grid max-h-52 grid-cols-2 gap-1 overflow-y-auto pr-0.5">
                  {MINUTES.map((minute) => (
                    <button
                      key={minute}
                      type="button"
                      onClick={() => pick({ minute })}
                      className={cell(value !== "" && current.minute === minute)}
                    >
                      {String(minute).padStart(2, "0")}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-1.5 px-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-dim">&nbsp;</p>
                <div className="grid gap-1">
                  {(["AM", "PM"] as const).map((meridiem) => (
                    <button
                      key={meridiem}
                      type="button"
                      onClick={() => pick({ meridiem })}
                      className={cell(value !== "" && current.meridiem === meridiem)}
                    >
                      {meridiem}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                if (!value) pick({});
                setOpen(false);
              }}
              className="mt-3 h-9 w-full rounded-full bg-white text-[13px] font-bold text-black transition hover:bg-white/90"
            >
              Listo
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
