"use client";

import { useEffect, useRef, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

const WEEKDAYS = ["D", "L", "M", "M", "J", "V", "S"];
const monthLabelFmt = new Intl.DateTimeFormat("es-HN", {
  month: "long",
  year: "numeric",
});
const dayLabelFmt = new Intl.DateTimeFormat("es-HN", {
  day: "numeric",
  month: "short",
});

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

function toKey(year: number, month: number, day: number): string {
  return `${year}-${pad(month + 1)}-${pad(day)}`;
}

function parseKey(key: string): { year: number; month: number; day: number } {
  const [year, month, day] = key.split("-").map(Number);
  return { year, month: month - 1, day };
}

/**
 * A custom-styled day picker, not the browser's native `<input type="date">`
 * popup: this app never ships an OS-chrome control for anything user-facing.
 */
export function DayPicker({
  value,
  max,
  onChange,
}: {
  /** `YYYY-MM-DD`, or undefined for "today". */
  value?: string;
  /** `YYYY-MM-DD`; days after this are disabled. */
  max: string;
  onChange: (date: string | undefined) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const selected = value ?? max;
  const { year: selYear, month: selMonth, day: selDay } = parseKey(selected);
  const [viewYear, setViewYear] = useState(selYear);
  const [viewMonth, setViewMonth] = useState(selMonth);
  const { year: maxYear, month: maxMonth, day: maxDay } = parseKey(max);

  useEffect(() => {
    if (!open) return;
    setViewYear(selYear);
    setViewMonth(selMonth);
  }, [open, selYear, selMonth]);

  useEffect(() => {
    if (!open) return;
    function onDocClick(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const firstWeekday = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells: Array<number | null> = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  const atMaxMonth = viewYear === maxYear && viewMonth === maxMonth;
  const pastMaxMonth =
    viewYear > maxYear || (viewYear === maxYear && viewMonth > maxMonth);

  function goMonth(delta: number) {
    const next = new Date(viewYear, viewMonth + delta, 1);
    setViewYear(next.getFullYear());
    setViewMonth(next.getMonth());
  }

  const isToday = selected === max;
  const buttonLabel = isToday
    ? "Hoy"
    : dayLabelFmt.format(new Date(`${selected}T12:00:00`));

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="inline-flex h-8 items-center gap-1.5 rounded-full border border-white/[0.12] bg-white/[0.04] px-3 text-[12px] font-semibold text-white/70 transition hover:bg-white/[0.08] hover:text-white"
      >
        <CalendarDays className="size-3.5 text-white/45" strokeWidth={1.5} aria-hidden />
        {buttonLabel}
      </button>
      {open ? (
        <div
          role="dialog"
          aria-label="Elegir día"
          className="absolute right-0 z-20 mt-2 w-[260px] rounded-[20px] border border-white/10 bg-[#141416] p-3.5 shadow-[0_16px_40px_rgba(0,0,0,0.45)]"
        >
          <div className="mb-2 flex items-center justify-between">
            <button
              type="button"
              onClick={() => goMonth(-1)}
              aria-label="Mes anterior"
              className="flex size-7 items-center justify-center rounded-full text-white/50 transition hover:bg-white/[0.08] hover:text-white"
            >
              <ChevronLeft className="size-4" strokeWidth={1.5} aria-hidden />
            </button>
            <p className="text-[12px] font-semibold capitalize text-white/85">
              {monthLabelFmt.format(new Date(viewYear, viewMonth, 1))}
            </p>
            <button
              type="button"
              onClick={() => goMonth(1)}
              disabled={pastMaxMonth}
              aria-label="Mes siguiente"
              className="flex size-7 items-center justify-center rounded-full text-white/50 transition hover:bg-white/[0.08] hover:text-white disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <ChevronRight className="size-4" strokeWidth={1.5} aria-hidden />
            </button>
          </div>
          <div className="grid grid-cols-7 gap-y-1 text-center text-[10.5px] font-medium text-white/35">
            {WEEKDAYS.map((label, i) => (
              <span key={i}>{label}</span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-y-1">
            {cells.map((day, i) => {
              if (day === null) return <span key={i} />;
              const key = toKey(viewYear, viewMonth, day);
              const disabled = atMaxMonth ? day > maxDay : pastMaxMonth;
              const isSelected = key === selected;
              return (
                <button
                  key={i}
                  type="button"
                  disabled={disabled}
                  onClick={() => {
                    onChange(key === max ? undefined : key);
                    setOpen(false);
                  }}
                  className={`mx-auto flex size-8 items-center justify-center rounded-full text-[12px] transition ${
                    isSelected
                      ? "bg-white font-semibold text-black"
                      : disabled
                        ? "text-white/20"
                        : "text-white/70 hover:bg-white/[0.1] hover:text-white"
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
          {!isToday ? (
            <button
              type="button"
              onClick={() => {
                onChange(undefined);
                setOpen(false);
              }}
              className="mt-2.5 w-full rounded-full py-1.5 text-center text-[12px] font-semibold text-accent transition hover:bg-white/[0.06]"
            >
              Volver a hoy
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
