"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, ChevronDown, Search } from "lucide-react";
import { useDismiss } from "./useDismiss";

const EASE = [0.32, 0.72, 0, 1] as const;

export type ComboboxOption = { value: string; label: string };

/** Sin tildes ni mayúsculas: "gastronomicos" encuentra "Gastronómicos". */
function normalize(text: string) {
  return text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

/**
 * Lista con buscador, para cuando hay demasiadas opciones para un Select.
 * Flechas para moverse, Enter para elegir y Escape para cerrar.
 */
export function Combobox({
  value,
  onChange,
  options,
  placeholder = "Elige uno",
  searchPlaceholder = "Buscar",
  emptyMessage = "Nada coincide con tu búsqueda.",
  invalid,
  "aria-label": ariaLabel,
}: {
  value: string;
  onChange: (value: string) => void;
  options: readonly ComboboxOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  invalid?: boolean;
  "aria-label"?: string;
}) {
  const reduced = useReducedMotion();
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const close = useCallback(() => setOpen(false), []);
  useDismiss(rootRef, open, close);

  const results = useMemo(() => {
    const needle = normalize(query.trim());
    return needle ? options.filter((option) => normalize(option.label).includes(needle)) : options;
  }, [options, query]);

  const selected = options.find((option) => option.value === value);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setActive(Math.max(options.findIndex((option) => option.value === value), 0));
  }, [open, options, value]);

  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  function choose(option: ComboboxOption | undefined) {
    if (!option) return;
    onChange(option.value);
    setOpen(false);
  }

  function onKeyDown(event: React.KeyboardEvent) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((index) => Math.min(index + 1, results.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((index) => Math.max(index - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      choose(results[active]);
    }
  }

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((open) => !open)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        aria-invalid={invalid || undefined}
        className={`group flex h-12 w-full items-center justify-between gap-2 rounded-[14px] border bg-surface-2 px-4 text-left text-[15px] outline-none transition duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] focus-visible:border-accent/60 ${
          invalid ? "border-red-400/50" : open ? "border-white/20 bg-white/[0.08]" : "border-border"
        }`}
      >
        <span className={`truncate ${selected ? "text-white" : "text-dim"}`}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          className={`size-4 shrink-0 text-dim transition-transform duration-300 ${open ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>
      <AnimatePresence>
        {open ? (
          <motion.div
            initial={reduced ? false : { opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.22, ease: EASE }}
            className="absolute inset-x-0 z-30 mt-2 origin-top overflow-hidden rounded-[16px] border border-border-strong bg-[#0c0c0e] shadow-[0_24px_60px_rgba(0,0,0,0.55)]"
          >
            <div className="flex items-center gap-2.5 border-b border-border px-4">
              <Search className="size-4 shrink-0 text-dim" strokeWidth={1.75} aria-hidden />
              <input
                autoFocus
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setActive(0);
                }}
                onKeyDown={onKeyDown}
                placeholder={searchPlaceholder}
                role="combobox"
                aria-expanded
                aria-controls={listId}
                aria-activedescendant={results[active] ? `${listId}-${active}` : undefined}
                aria-autocomplete="list"
                className="h-12 w-full bg-transparent text-[15px] text-white outline-none placeholder:text-dim"
              />
            </div>
            <ul ref={listRef} id={listId} role="listbox" className="max-h-64 overflow-y-auto p-1.5">
              {results.length === 0 ? (
                <li className="px-3 py-6 text-center text-[14px] text-dim">{emptyMessage}</li>
              ) : (
                results.map((option, index) => {
                  const isSelected = option.value === value;
                  return (
                    <li
                      key={option.value}
                      id={`${listId}-${index}`}
                      data-index={index}
                      role="option"
                      aria-selected={isSelected}
                      onMouseEnter={() => setActive(index)}
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => choose(option)}
                      className={`relative flex cursor-pointer select-none items-center rounded-[10px] py-2.5 pl-8 pr-3 text-[15px] text-white transition-colors duration-200 ${
                        index === active ? "bg-white/[0.08]" : ""
                      } ${isSelected ? "font-semibold" : ""}`}
                    >
                      {isSelected ? (
                        <Check className="absolute left-2.5 size-3.5 text-accent" aria-hidden />
                      ) : null}
                      {option.label}
                    </li>
                  );
                })
              )}
            </ul>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
