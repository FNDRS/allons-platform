"use client";

import { AlertCircle, Inbox } from "lucide-react";
import { Button } from "./Button";

export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`animate-pulse rounded-2xl bg-white/[0.06] ${className}`}
    />
  );
}

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center rounded-[22px] border border-dashed border-white/12 px-6 py-12 text-center">
      <Inbox className="size-7 text-white/30" aria-hidden />
      <p className="mt-4 text-lg font-semibold tracking-tight">{title}</p>
      {body ? <p className="mt-1.5 max-w-sm text-sm text-white/55">{body}</p> : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

export function ErrorState({
  message,
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center rounded-[22px] border border-red-500/20 bg-red-500/[0.06] px-6 py-10 text-center">
      <AlertCircle className="size-7 text-red-300" aria-hidden />
      <p className="mt-4 text-base font-semibold">No pudimos cargar esto</p>
      <p className="mt-1.5 max-w-sm text-sm text-white/60">
        {message ?? "Intenta de nuevo en un momento."}
      </p>
      {onRetry ? (
        <Button variant="secondary" size="sm" className="mt-5" onClick={onRetry}>
          Reintentar
        </Button>
      ) : null}
    </div>
  );
}

export function Badge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "accent" | "success" | "warn" | "danger";
}) {
  const tones = {
    neutral: "bg-white/[0.08] text-white/70",
    accent: "bg-accent/15 text-accent",
    success: "bg-emerald-500/15 text-emerald-300",
    warn: "bg-amber-500/15 text-amber-300",
    danger: "bg-red-500/15 text-red-300",
  } as const;
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[12px] font-semibold ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
