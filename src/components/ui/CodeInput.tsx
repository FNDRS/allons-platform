"use client";

import { useEffect, useRef, useState, type ComponentProps } from "react";

/**
 * One box per digit, spanning the row. A single invisible input behind the
 * boxes holds the value, so the keyboard, paste and the one-time-code
 * autofill of iOS and Android all land in one place; the boxes only show
 * what it holds. Typing appends, Backspace removes the last digit, tapping
 * any box focuses the field.
 */
export function CodeInput({
  value,
  onChange,
  length = 6,
  invalid = false,
  className = "",
  disabled,
  autoFocus,
  ...props
}: Omit<ComponentProps<"input">, "value" | "onChange" | "type" | "maxLength"> & {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  invalid?: boolean;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [focused, setFocused] = useState(false);
  const digits = value.replace(/\D/g, "").slice(0, length);
  const active = Math.min(digits.length, length - 1);

  // The caret always sits at the end: a digit typed anywhere goes last.
  const toEnd = () => {
    const el = input.current;
    if (!el) return;
    const end = el.value.length;
    el.setSelectionRange(end, end);
  };
  useEffect(() => {
    if (focused) toEnd();
  }, [digits, focused]);

  return (
    <div
      className={`relative ${className}`}
      onPointerDown={(event) => {
        // Keep the tap from landing in the input itself, which would move
        // the caret; focus it and let the effect put the caret at the end.
        event.preventDefault();
        input.current?.focus();
      }}
    >
      <input
        {...props}
        ref={input}
        type="text"
        value={digits}
        disabled={disabled}
        autoFocus={autoFocus}
        inputMode="numeric"
        pattern="[0-9]*"
        autoComplete="one-time-code"
        aria-invalid={invalid || undefined}
        maxLength={length}
        // Keys are handled here so a digit always goes last and Backspace
        // always takes the last one, wherever the caret ended up. onChange
        // is left for what is not a key: paste and the one-time-code fill.
        onKeyDown={(event) => {
          if (event.metaKey || event.ctrlKey || event.altKey) return;
          if (/^\d$/.test(event.key)) {
            event.preventDefault();
            onChange((digits + event.key).slice(0, length));
          } else if (event.key === "Backspace" || event.key === "Delete") {
            event.preventDefault();
            onChange(digits.slice(0, -1));
          }
        }}
        onChange={(event) =>
          onChange(event.target.value.replace(/\D/g, "").slice(0, length))
        }
        onFocus={() => {
          setFocused(true);
          requestAnimationFrame(toEnd);
        }}
        onBlur={() => setFocused(false)}
        onSelect={toEnd}
        className="absolute inset-0 z-10 h-full w-full cursor-default opacity-0 [caret-color:transparent] disabled:cursor-not-allowed"
      />
      <div
        aria-hidden
        className="grid gap-2 sm:gap-2.5"
        style={{ gridTemplateColumns: `repeat(${length}, minmax(0, 1fr))` }}
      >
        {Array.from({ length }, (_, index) => {
          const digit = digits[index] ?? "";
          const isActive = focused && !disabled && index === active && digits.length < length;
          const filled = digit !== "";
          return (
            <div
              key={index}
              className={[
                "relative flex h-14 items-center justify-center rounded-[14px] border text-[22px] font-semibold tabular-nums text-white transition-[border-color,background-color,box-shadow,transform] duration-200 sm:h-16 sm:text-[26px]",
                invalid
                  ? "border-red-400/60 bg-red-500/[0.06]"
                  : isActive
                    ? "border-accent/80 bg-white/[0.08] shadow-[0_0_0_4px_rgba(246,112,16,0.14),inset_0_1px_0_rgba(255,255,255,0.08)]"
                    : filled
                      ? "border-white/18 bg-white/[0.06] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                      : "border-border bg-surface-2",
                disabled ? "opacity-50" : "",
              ].join(" ")}
            >
              {filled ? (
                <span className="animate-[code-pop_160ms_ease-out]">{digit}</span>
              ) : isActive ? (
                <span className="h-6 w-0.5 animate-[code-blink_1.1s_steps(1)_infinite] rounded-full bg-accent sm:h-7" />
              ) : (
                <span className="size-1.5 rounded-full bg-white/14" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
