import { Smartphone } from "lucide-react";
import { glassCtaClass } from "@/components/ui/cta";

/** Nudge to follow the comercio in the app, where alerts and class bookings live. */
export function ComercioAppCard({
  name,
  appDeepLink,
  appStoreLink,
}: {
  name: string;
  appDeepLink: string;
  appStoreLink: string;
}) {
  return (
    <aside className="relative overflow-hidden rounded-[24px] border border-accent/25 bg-accent/[0.07] p-5">
      <span
        className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-accent/25 blur-3xl"
        aria-hidden
      />
      <div className="relative">
        <span className="grid size-10 place-items-center rounded-[13px] bg-white/[0.06] text-white/85 shadow-[inset_0_1px_0_rgba(255,255,255,0.16)] ring-1 ring-white/15">
          <BellMark />
        </span>
        <p className="mt-4 text-[17px] font-bold leading-tight tracking-tight">
          Entérate primero de lo nuevo de {name}
        </p>
        <p className="mt-1.5 text-[13px] leading-5 text-white/60">
          Síguelo en la app para recibir avisos de eventos y reservar sus clases.
        </p>
        <div className="mt-4 flex flex-col gap-2">
          <a
            href={appDeepLink}
            className={`inline-flex h-10 items-center justify-center gap-2 text-[13px] ${glassCtaClass}`}
          >
            <Smartphone className="size-4" strokeWidth={1.5} aria-hidden />
            Abrir en la app
          </a>
          <a
            href={appStoreLink}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-10 items-center justify-center rounded-full border border-white/12 text-[13px] font-semibold text-white/75 transition hover:bg-white/[0.08] hover:text-white"
          >
            Descargar en el App Store
          </a>
        </div>
      </div>
    </aside>
  );
}

function BellMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-[18px]" fill="none" aria-hidden>
      <path
        d="M6.8 16.6h10.4M8.2 16.6V10.8a3.8 3.8 0 1 1 7.6 0v5.8"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M12 4.6v1.2M10.4 16.6a1.6 1.6 0 0 0 3.2 0"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}
