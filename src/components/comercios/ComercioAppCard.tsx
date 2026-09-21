import { Bell, Smartphone } from "lucide-react";
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
        <span className="grid size-10 place-items-center rounded-[13px] bg-accent text-black">
          <Bell className="size-4" aria-hidden />
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
            <Smartphone className="size-4" aria-hidden />
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
