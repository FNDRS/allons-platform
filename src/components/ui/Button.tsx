"use client";

import type { ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";

type Variant = "primary" | "secondary" | "ghost" | "glass" | "danger" | "white";
type Size = "sm" | "md" | "lg" | "icon" | "icon-sm";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  full?: boolean;
};

const VARIANT: Record<Variant, string> = {
  primary:
    "bg-accent text-black hover:bg-[#ff7d24] hover:shadow-[0_10px_40px_rgba(246,112,16,0.28)] disabled:shadow-none",
  white: "bg-white text-black hover:bg-white/90",
  secondary:
    "border border-border-strong bg-surface-2 text-white hover:bg-white/[0.1]",
  ghost: "text-muted hover:text-white hover:bg-surface-2",
  glass:
    "border border-border bg-surface-2 text-white/85 hover:bg-white/[0.1] hover:text-white",
  danger: "border border-danger/30 bg-danger/10 text-red-200 hover:bg-danger/20",
};

const SIZE: Record<Size, string> = {
  sm: "h-9 px-4 text-[13px] rounded-full",
  md: "h-11 px-5 text-sm rounded-full",
  lg: "h-13 px-6 text-[15px] rounded-full",
  icon: "size-11 rounded-full",
  "icon-sm": "size-9 rounded-full",
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  full = false,
  className = "",
  children,
  disabled,
  ...rest
}: Props) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={`inline-flex shrink-0 items-center justify-center gap-2 font-bold tracking-tight transition duration-150 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 ${VARIANT[variant]} ${SIZE[size]} ${full ? "w-full" : ""} ${className}`}
    >
      {loading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
      {children}
    </button>
  );
}
