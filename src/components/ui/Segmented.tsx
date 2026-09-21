"use client";

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
            className={`h-full rounded-full px-4 text-[13px] font-semibold transition ${
              active ? "bg-white text-black" : "text-muted hover:text-white"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
