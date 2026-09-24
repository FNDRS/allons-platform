"use client";

import { useState } from "react";
import { Share } from "lucide-react";
import { glassCtaClass } from "@/components/ui/cta";

function eventPublicUrl(eventId: string) {
  return `https://allonsapp.com/events/${encodeURIComponent(eventId)}`;
}

export function ShareEventButton({
  eventId,
  title,
}: {
  eventId: string;
  title: string;
}) {
  const [copied, setCopied] = useState(false);

  async function onShare() {
    const url = eventPublicUrl(eventId);
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title, url });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={() => void onShare()}
      className={`inline-flex h-10 w-full shrink-0 items-center justify-center gap-1.5 px-4 text-[13px] sm:w-auto ${glassCtaClass}`}
    >
      <Share className="size-3.5 text-white/45" strokeWidth={1.5} aria-hidden />
      <span aria-live="polite">{copied ? "Enlace copiado" : "Compartir"}</span>
    </button>
  );
}
