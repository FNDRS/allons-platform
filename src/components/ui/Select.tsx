"use client";

import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import { useState, type ReactNode } from "react";

const EMPTY = "__empty__";

function toRadixValue(value: string) {
  return value === "" ? EMPTY : value;
}

function fromRadixValue(value: string) {
  return value === EMPTY ? "" : value;
}

/**
 * Custom select (Radix / shadcn). Never a native `<select>`: those open the
 * OS picker and cannot match the rest of the form.
 */
export function Select({
  name,
  defaultValue,
  value,
  onValueChange,
  required,
  disabled,
  placeholder,
  className = "",
  "aria-label": ariaLabel,
  children,
}: {
  name?: string;
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  "aria-label"?: string;
  children: ReactNode;
}) {
  const [uncontrolled, setUncontrolled] = useState(defaultValue ?? "");
  const current = value !== undefined ? value : uncontrolled;

  function handleChange(next: string) {
    const parsed = fromRadixValue(next);
    if (value === undefined) setUncontrolled(parsed);
    onValueChange?.(parsed);
  }

  return (
    <div className={`relative ${className}`}>
      {name ? <input type="hidden" name={name} value={current} required={required} /> : null}
      <SelectPrimitive.Root
        value={toRadixValue(current)}
        onValueChange={handleChange}
        disabled={disabled}
      >
        <SelectPrimitive.Trigger
          aria-label={ariaLabel}
          className="flex h-12 w-full cursor-pointer items-center justify-between gap-2 rounded-[14px] border border-border bg-surface-2 px-4 text-left text-[15px] text-white outline-none transition focus-visible:border-accent/60 focus-visible:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-50 data-[placeholder]:text-dim"
        >
          <SelectPrimitive.Value placeholder={placeholder} />
          <SelectPrimitive.Icon asChild>
            <ChevronDown className="size-4 shrink-0 text-dim" aria-hidden />
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>
        <SelectPrimitive.Portal>
          <SelectPrimitive.Content
            position="popper"
            sideOffset={6}
            collisionPadding={8}
            className="z-[90] min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-[14px] border border-border-strong bg-[#0c0c0e] shadow-[0_16px_48px_rgba(0,0,0,0.55)]"
          >
            <SelectPrimitive.Viewport className="p-1.5">
              {children}
            </SelectPrimitive.Viewport>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>
    </div>
  );
}

export function SelectItem({
  value,
  children,
  disabled,
  className = "",
}: {
  value: string;
  children: ReactNode;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <SelectPrimitive.Item
      value={toRadixValue(value)}
      disabled={disabled}
      className={`relative flex cursor-pointer select-none items-center rounded-[10px] py-2.5 pl-8 pr-3 text-[15px] text-white outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-40 data-[highlighted]:bg-white/[0.08] data-[state=checked]:font-semibold ${className}`}
    >
      <SelectPrimitive.ItemIndicator className="absolute left-2.5 inline-flex">
        <Check className="size-3.5 text-accent" aria-hidden />
      </SelectPrimitive.ItemIndicator>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}
