"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { useDashboardPrivacy } from "./dashboardPrivacy";

const MASK = "••••••";
const DIGITS = "0123456789";

function mixDigits(value: string, reveal: number) {
  return value
    .split("")
    .map((char, index) => {
      if (index < reveal || !/\d/.test(char)) return char;
      return DIGITS[Math.floor(Math.random() * DIGITS.length)];
    })
    .join("");
}

/** Settles a dashboard figure from random digits. Money stays masked until privacy is known. */
export function DashboardFigure({
  value,
  secret = false,
}: {
  value: string;
  secret?: boolean;
}) {
  const { hidden, ready } = useDashboardPrivacy();
  const masked = secret && (!ready || hidden);
  const [text, setText] = useState(() => (secret ? MASK : mixDigits(value, 0)));
  const played = useRef(false);

  useLayoutEffect(() => {
    if (masked) {
      setText(MASK);
      return;
    }
    if (value === "…") {
      setText(value);
      return;
    }
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (played.current || reduce) {
      setText(value);
      played.current = true;
      return;
    }
    played.current = true;
    setText(mixDigits(value, 0));
    let frame = 0;
    const frames = 16;
    const id = window.setInterval(() => {
      frame += 1;
      if (frame >= frames) {
        setText(value);
        window.clearInterval(id);
        return;
      }
      setText(mixDigits(value, Math.floor((frame / frames) * value.length)));
    }, 36);
    return () => window.clearInterval(id);
  }, [masked, value]);

  return (
    <span className={masked ? "tracking-[0.18em]" : "tabular-nums"}>{text}</span>
  );
}
