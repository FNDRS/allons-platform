"use client";

import type {
  InputHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

const BASE =
  "w-full rounded-[14px] border border-border bg-surface-2 px-4 text-[15px] text-white placeholder:text-dim outline-none transition focus:border-accent/60 focus:bg-white/[0.08] disabled:opacity-50";

export function Label({
  children,
  hint,
}: {
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <span className="mb-1.5 block text-[12px] font-semibold uppercase tracking-[0.14em] text-muted">
      {children}
      {hint ? <span className="ml-1 font-medium normal-case tracking-normal text-dim">{hint}</span> : null}
    </span>
  );
}

export function Input({
  className = "",
  ...rest
}: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...rest} className={`${BASE} h-12 ${className}`} />;
}

export function Textarea({
  className = "",
  ...rest
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...rest} className={`${BASE} min-h-24 py-3 ${className}`} />;
}

export function Select({
  className = "",
  children,
  ...rest
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...rest} className={`${BASE} h-12 appearance-none ${className}`}>
      {children}
    </select>
  );
}

export function FieldError({ children }: { children?: React.ReactNode }) {
  if (!children) return null;
  return <p className="mt-1.5 text-[13px] text-red-300">{children}</p>;
}
