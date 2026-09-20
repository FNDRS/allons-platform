"use client";

import type { InputHTMLAttributes } from "react";
import { ArrowRight, Search } from "lucide-react";

/**
 * Rounded pill input with an inline circular icon button, the search field of
 * the hero. `onAction` fires on the button and on Enter.
 */
export function SearchPill({
  onAction,
  actionLabel = "Buscar",
  className = "",
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & {
  onAction?: () => void;
  actionLabel?: string;
}) {
  return (
    <div
      className={`flex h-14 items-center gap-2 rounded-full border border-border bg-surface-2 pl-5 pr-2 transition focus-within:border-border-strong focus-within:bg-white/[0.08] ${className}`}
    >
      <Search className="size-4 shrink-0 text-dim" aria-hidden />
      <input
        {...rest}
        type="search"
        enterKeyHint="search"
        onKeyDown={(event) => {
          if (event.key === "Enter") onAction?.();
          rest.onKeyDown?.(event);
        }}
        className="h-full min-w-0 flex-1 bg-transparent text-[15px] text-white outline-none placeholder:text-dim [&::-webkit-search-cancel-button]:hidden"
      />
      <button
        type="button"
        onClick={onAction}
        aria-label={actionLabel}
        className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/[0.08] text-white/80 transition hover:bg-accent hover:text-black"
      >
        <ArrowRight className="size-4" aria-hidden />
      </button>
    </div>
  );
}

/** Glass chip, single-select. */
export function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`h-10 shrink-0 rounded-full border px-4 text-[13px] font-semibold transition ${
        active
          ? "border-white bg-white text-black"
          : "border-border bg-surface text-muted hover:border-border-strong hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}
