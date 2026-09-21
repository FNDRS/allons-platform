"use client";

import type { InputHTMLAttributes, ReactNode } from "react";
import { ArrowRight, Search } from "lucide-react";
import { SmoothInput } from "./SmoothInput";

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
      <SmoothInput
        {...rest}
        type="search"
        enterKeyHint="search"
        onKeyDown={(event) => {
          if (event.key === "Enter") onAction?.();
          rest.onKeyDown?.(event);
        }}
        wrapperClassName="min-w-0 flex-1 !rounded-none !border-0 !bg-transparent !px-0 focus-within:!bg-transparent"
        className="!h-full [&::-webkit-search-cancel-button]:hidden"
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
  children: ReactNode;
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

const PILL = {
  solid:
    "bg-white text-black shadow-[0_6px_18px_rgba(0,0,0,0.18)]",
  glass:
    "bg-black/45 text-white ring-1 ring-white/15 backdrop-blur-md",
  mute: "bg-white/10 text-white/50 ring-1 ring-white/10",
} as const;

/** Status chip: white, glass, or mute. Use this for every label pill. */
export function StatusPill({
  tone = "solid",
  children,
  className = "",
}: {
  tone?: keyof typeof PILL;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex shrink-0 items-center whitespace-nowrap rounded-full px-3.5 py-1.5 text-[12px] font-semibold tracking-tight ${PILL[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
