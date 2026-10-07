"use client";

import { useCallback, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { useDismiss } from "./useDismiss";

const EASE = [0.32, 0.72, 0, 1] as const;
const WEEKDAYS = ["D", "L", "M", "M", "J", "V", "S"];
const monthFmt = new Intl.DateTimeFormat("es-HN", { month: "long", year: "numeric" });
const longFmt = new Intl.DateTimeFormat("es-HN", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

const pad = (value: number) => String(value).padStart(2, "0");
const toKey = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;
function parseKey(key: string) {
  const [year, month, day] = key.split("-").map(Number);
  return { year, month: month - 1, day };
}

/**
 * Campo de fecha con el look de los inputs, para formularios. A diferencia de
 * `DayPicker` (el filtro de "hoy hacia atrás"), éste elige fechas desde `min`
 * en adelante. Nunca el `<input type="date">` del navegador.
 */
export function DateField({
  id,
  value,
  min,
  onChange,
  placeholder = "Elige una fecha",
  invalid,
  describedBy,
}: {
  id?: string;
  /** `YYYY-MM-DD` o vacío. */
  value: string;
  /** `YYYY-MM-DD`; los días antes de éste no se pueden elegir. */
  min: string;
  onChange: (date: string) => void;
  placeholder?: string;
  invalid?: boolean;
  describedBy?: string;
}) {
  const reduced = useReducedMotion();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const anchor = parseKey(value || min);
  const [view, setView] = useState({ year: anchor.year, month: anchor.month });
  const close = useCallback(() => setOpen(false), []);
  useDismiss(rootRef, open, close);

  const minParts = parseKey(min);
  const atMinMonth = view.year === minParts.year && view.month === minParts.month;
  const firstWeekday = new Date(view.year, view.month, 1).getDay();
  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();
  const cells: Array<number | null> = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  function shift(delta: number) {
    const next = new Date(view.year, view.month + delta, 1);
    setView({ year: next.getFullYear(), month: next.getMonth() });
  }

  function toggle() {
    if (!open) {
      const target = parseKey(value || min);
      setView({ year: target.year, month: target.month });
    }
    setOpen((current) => !current);
  }

  return (
    <div className="relative" ref={rootRef}>
      <button
        id={id}
        type="button"
        onClick={toggle}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        className={`flex h-12 w-full items-center gap-3 rounded-[14px] border bg-surface-2 px-4 text-left text-[15px] outline-none transition focus-visible:border-accent/60 ${
          invalid ? "border-red-400/50" : open ? "border-white/20 bg-white/[0.08]" : "border-border"
        }`}
      >
        <CalendarDays className="size-4 shrink-0 text-dim" strokeWidth={1.75} aria-hidden />
        <span className={`truncate first-letter:uppercase ${value ? "text-white" : "text-dim"}`}>
          {value ? longFmt.format(new Date(`${value}T12:00:00`)) : placeholder}
        </span>
      </button>
      <AnimatePresence>
        {open ? (
          <motion.div
            role="dialog"
            aria-label="Elegir fecha"
            initial={reduced ? false : { opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.22, ease: EASE }}
            className="absolute left-0 z-30 mt-2 w-[min(320px,calc(100vw-2.5rem))] origin-top-left rounded-[20px] border border-white/10 bg-[#141416] p-4 shadow-[0_24px_60px_rgba(0,0,0,0.55)]"
          >
            <div className="mb-3 flex items-center justify-between">
              <button
                type="button"
                onClick={() => shift(-1)}
                disabled={atMinMonth}
                aria-label="Mes anterior"
                className="flex size-8 items-center justify-center rounded-full text-white/60 transition hover:bg-white/[0.08] hover:text-white disabled:opacity-25 disabled:hover:bg-transparent"
              >
                <ChevronLeft className="size-4" aria-hidden />
              </button>
              <p className="text-[13px] font-semibold text-white/90 first-letter:uppercase">
                {monthFmt.format(new Date(view.year, view.month, 1))}
              </p>
              <button
                type="button"
                onClick={() => shift(1)}
                aria-label="Mes siguiente"
                className="flex size-8 items-center justify-center rounded-full text-white/60 transition hover:bg-white/[0.08] hover:text-white"
              >
                <ChevronRight className="size-4" aria-hidden />
              </button>
            </div>
            <div className="grid grid-cols-7 gap-y-1 text-center text-[11px] font-medium text-white/35">
              {WEEKDAYS.map((label, i) => (
                <span key={i}>{label}</span>
              ))}
            </div>
            <div className="mt-1 grid grid-cols-7 gap-y-1">
              {cells.map((day, i) => {
                if (day === null) return <span key={i} />;
                const key = toKey(view.year, view.month, day);
                const disabled = key < min;
                const selected = key === value;
                const isMin = key === min;
                return (
                  <button
                    key={i}
                    type="button"
                    disabled={disabled}
                    onClick={() => {
                      onChange(key);
                      setOpen(false);
                    }}
                    className={`relative mx-auto flex size-9 items-center justify-center rounded-full text-[13px] tabular-nums transition ${
                      selected
                        ? "bg-accent font-bold text-black"
                        : disabled
                          ? "text-white/15"
                          : "text-white/75 hover:bg-white/[0.1] hover:text-white"
                    }`}
                  >
                    {day}
                    {isMin && !selected ? (
                      <span aria-hidden className="absolute bottom-1 size-1 rounded-full bg-accent" />
                    ) : null}
                  </button>
                );
              })}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
