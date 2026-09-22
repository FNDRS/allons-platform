"use client";

import { useCountdown } from "@/hooks/useCountdown";

/**
 * How long the buyer has to finish. When it hits zero the form leaves for
 * the event, so this only renders while time is left.
 */
export function HoldCountdown({ expiresAt }: { expiresAt: string }) {
  const countdown = useCountdown(expiresAt);

  if (countdown === null) return null;

  const secondsLeft = Math.max(
    0,
    Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000),
  );
  const urgent = secondsLeft <= 60;

  return (
    <div
      role="timer"
      aria-live="polite"
      className="flex items-center justify-between rounded-full border border-white/[0.08] bg-white/[0.04] px-4 py-2.5"
    >
      <span className="text-[12px] font-medium tracking-tight text-white/40">
        Se libera en
      </span>
      <span
        className={`text-[15px] font-bold tabular-nums tracking-tight ${
          urgent ? "text-red-300" : "text-white"
        }`}
      >
        {countdown}
      </span>
    </div>
  );
}
