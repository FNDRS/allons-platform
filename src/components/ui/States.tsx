"use client";

import { Inbox } from "lucide-react";
import { glassCtaClass } from "./cta";
import { EdgeLight } from "./EdgeLight";
import { StatusPill } from "./Pill";

export function Skeleton({ className = "" }: { className?: string }) {
  return <div aria-hidden className={`shimmer rounded-[18px] ${className}`} />;
}

export function EmptyState({
  title,
  body,
  action,
  className = "",
}: {
  title: string;
  body?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-col items-center rounded-[18px] border border-dashed border-border-strong px-6 py-14 text-center ${className}`}
    >
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
    <EdgeLight tone="danger" className="w-full">
      <div
        role="alert"
        className={`flex w-full items-center gap-3 rounded-full bg-[#0a0a0b]/85 backdrop-blur-md ${
          onRetry ? "p-1.5 pl-5 sm:pl-6" : "px-6 py-3.5"
        }`}
      >
        <p className="min-w-0 flex-1 text-[13px] leading-snug tracking-tight text-white/70">
          {message ?? "Intenta de nuevo en un momento."}
        </p>
        {onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            className={`${glassCtaClass} h-8 shrink-0 px-3.5 text-[12px]`}
          >
            Reintentar
          </button>
        ) : null}
      </div>
    </EdgeLight>
  );
}

export function Badge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "accent" | "success" | "warn" | "danger";
}) {
  const map = {
    neutral: "mute",
    accent: "solid",
    success: "solid",
    warn: "glass",
    danger: "mute",
  } as const;
  return <StatusPill tone={map[tone]}>{children}</StatusPill>;
}
