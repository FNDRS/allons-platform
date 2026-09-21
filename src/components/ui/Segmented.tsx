"use client";

import { motion, useReducedMotion } from "framer-motion";

const EASE = [0.32, 0.72, 0, 1] as const;

/** Two to four options in a glass track; a single-choice radiogroup. */
export function Segmented<T extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
  label: string;
}) {
  const reduced = useReducedMotion();
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="inline-flex h-11 items-center gap-1 rounded-full border border-border bg-surface p-1"
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            role="radio"
            type="button"
            aria-checked={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(option.value)}
            onKeyDown={(event) => {
              if (!["ArrowRight", "ArrowLeft", "ArrowDown", "ArrowUp"].includes(event.key)) return;
              event.preventDefault();
              const index = options.findIndex((item) => item.value === value);
              const step = event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : -1;
              const next = options[(index + step + options.length) % options.length];
              onChange(next.value);
              (event.currentTarget.parentElement?.children[
                (index + step + options.length) % options.length
              ] as HTMLElement | undefined)?.focus();
            }}
            className={`relative z-0 h-full rounded-full px-4 text-[13px] font-semibold transition-colors duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
              active ? "text-black" : "text-muted hover:text-white"
            }`}
          >
            {active ? (
              <motion.span
                layoutId={`seg-${label}`}
                className="absolute inset-0 rounded-full bg-white"
                transition={
                  reduced
                    ? { duration: 0 }
                    : { duration: 0.45, ease: EASE }
                }
              />
            ) : null}
            <span className="relative z-10">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
