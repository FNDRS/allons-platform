"use client";

import { AlertCircle, Inbox } from "lucide-react";
import { Button } from "./Button";

export function Skeleton({ className = "" }: { className?: string }) {
  return <div aria-hidden className={`shimmer rounded-[18px] ${className}`} />;
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
    <div className="flex flex-col items-center rounded-[18px] border border-dashed border-border-strong px-6 py-14 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-surface-2">
        <Inbox className="size-5 text-dim" aria-hidden />
      </span>
      <p className="mt-5 text-lg font-bold tracking-tight">{title}</p>
      {body ? <p className="mt-1.5 max-w-sm text-sm text-muted">{body}</p> : null}
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
    <div className="flex flex-col items-center rounded-[18px] border border-danger/20 bg-danger/[0.06] px-6 py-10 text-center">
      <AlertCircle className="size-6 text-red-300" aria-hidden />
      <p className="mt-4 text-base font-bold tracking-tight">No pudimos cargar esto</p>
      <p className="mt-1.5 max-w-sm text-sm text-muted">
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
    neutral: "bg-surface-2 text-muted",
    accent: "bg-accent-soft text-accent",
    success: "bg-emerald-500/15 text-emerald-300",
    warn: "bg-amber-500/15 text-amber-300",
    danger: "bg-danger/15 text-red-300",
  } as const;
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[12px] font-semibold ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
