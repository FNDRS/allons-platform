"use client";

import { useEffect, useState } from "react";

// Launch in Honduras time (UTC-06:00).
const LAUNCH_DATE = new Date("2026-10-31T19:00:00-06:00").getTime();

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

function getTimeLeft(): TimeLeft {
  const diff = Math.max(0, LAUNCH_DATE - Date.now());
  const seconds = Math.floor(diff / 1000);

  return {
    days: Math.floor(seconds / 86400),
    hours: Math.floor((seconds % 86400) / 3600),
    minutes: Math.floor((seconds % 3600) / 60),
    seconds: seconds % 60,
  };
}

function pad(value: number) {
  return value.toString().padStart(2, "0");
}

export function Countdown() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    setTimeLeft(getTimeLeft());
    const interval = window.setInterval(() => setTimeLeft(getTimeLeft()), 1000);

    return () => window.clearInterval(interval);
  }, []);

  const segments = [
    { label: "Días", value: timeLeft ? timeLeft.days.toString() : "00" },
    { label: "Horas", value: timeLeft ? pad(timeLeft.hours) : "00" },
    { label: "Minutos", value: timeLeft ? pad(timeLeft.minutes) : "00" },
    { label: "Segundos", value: timeLeft ? pad(timeLeft.seconds) : "00" },
  ];

  return (
    <section
      aria-label="Cuenta regresiva para el lanzamiento"
      className="fade-up delay-6 mt-10 flex flex-col items-center"
    >
      <div className="grid w-full max-w-md grid-cols-4 gap-2 sm:max-w-none sm:gap-3">
        {segments.map((segment, index) => (
          <div key={segment.label} className="flex min-w-0 items-stretch gap-2 sm:gap-3">
            <div className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-white/[0.035] px-1 py-3 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] sm:min-w-[92px] sm:px-5 sm:py-4">
              <div className="font-mono text-2xl sm:text-4xl font-semibold leading-none tracking-[-0.04em] text-white tabular-nums">
                {segment.value}
              </div>
              <div className="mt-2 truncate text-[8px] font-medium uppercase tracking-[0.08em] text-white/38 sm:text-[10px] sm:tracking-[0.22em]">
                {segment.label}
              </div>
            </div>
            {index < segments.length - 1 ? (
              <div className="hidden items-center text-xl font-semibold text-white/22 sm:flex">
                :
              </div>
            ) : null}
          </div>
        ))}
      </div>

      <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.035] px-4 py-2 text-xs font-medium uppercase tracking-[0.18em] text-white/55 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] sm:text-[13px]">
        <CalendarIcon />
        Lanzamiento: 31 de octubre
      </p>
    </section>
  );
}

function CalendarIcon() {
  return (
    <svg
      aria-hidden
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      className="text-[var(--color-accent)]"
    >
      <path
        d="M7 3v3M17 3v3M4 9h16M6 5h12a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
