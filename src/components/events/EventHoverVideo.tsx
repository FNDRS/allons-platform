"use client";

import { useEffect, useRef, useState } from "react";

/** Plays a muted loop over the poster while the card is hovered. */
export function EventHoverVideo({ src }: { src: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const host = video.closest("a");
    if (!host) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (reduce || !canHover) return;

    const play = () => {
      setActive(true);
      void video.play().catch(() => setActive(false));
    };
    const stop = () => {
      setActive(false);
      video.pause();
      video.currentTime = 0;
    };

    host.addEventListener("pointerenter", play);
    host.addEventListener("pointerleave", stop);
    return () => {
      host.removeEventListener("pointerenter", play);
      host.removeEventListener("pointerleave", stop);
      stop();
    };
  }, [src]);

  return (
    <video
      ref={ref}
      className={`pointer-events-none absolute inset-0 z-[1] h-full w-full object-cover transition-opacity duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        active ? "opacity-100" : "opacity-0"
      }`}
      src={src}
      muted
      loop
      playsInline
      preload="auto"
      aria-hidden
    />
  );
}
