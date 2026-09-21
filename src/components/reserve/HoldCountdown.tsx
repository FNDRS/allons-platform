"use client";

import { Clock } from "lucide-react";
import { useCountdown } from "@/hooks/useCountdown";
import { Button } from "@/components/ui/Button";

/**
 * Shown as soon as a paid ticket is selected: how long the buyer has to
 * finish, then a nudge to start over once it runs out.
 */
export function HoldCountdown({
  expiresAt,
  onRestart,
}: {
  expiresAt: string;
  onRestart: () => void;
}) {
  const countdown = useCountdown(expiresAt);

  if (countdown === null) {
    return (
      <div
        role="alert"
        className="flex flex-col gap-3 rounded-[18px] border border-red-500/30 bg-red-500/[0.08] px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <p className="font-semibold text-red-200">Reserva vencida</p>
          <p className="mt-0.5 text-sm text-white/70">
            El tiempo para completar tu compra terminó. Empieza el proceso de nuevo.
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={onRestart}>
          Empezar de nuevo
        </Button>
      </div>
    );
  }

  const secondsLeft = Math.max(
    0,
    Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000),
  );
  const urgent = secondsLeft <= 60;

  return (
    <div
      role="timer"
      aria-live="polite"
      className="flex items-center justify-between rounded-[18px] border border-white/[0.08] bg-white/[0.03] px-5 py-3.5"
    >
      <span className="flex items-center gap-2 text-sm text-white/60">
        <Clock className="size-4" aria-hidden />
        Tu reserva vence en
      </span>
      <span
        className={`text-lg font-bold tabular-nums tracking-tight ${
          urgent ? "text-red-300" : "text-white"
        }`}
      >
        {countdown}
      </span>
    </div>
  );
}
