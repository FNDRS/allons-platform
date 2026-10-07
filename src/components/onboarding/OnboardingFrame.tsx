import { AllonsLogo } from "@/components/AllonsLogo";

/**
 * Marco del registro de comercio: sin navegación de la app (quien llega aquí
 * no tiene cuenta todavía), sólo la marca y un brillo naranja de fondo.
 */
export function OnboardingFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-dvh overflow-x-clip bg-bg text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(60%_60%_at_50%_0%,rgba(246,112,16,0.18),transparent_70%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent"
      />
      <header className="relative mx-auto flex max-w-2xl items-center justify-between px-5 pt-6 sm:px-6 sm:pt-8">
        <AllonsLogo className="h-6 w-auto" />
        <span className="rounded-full border border-border bg-surface px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
          Comercios
        </span>
      </header>
      <main className="relative mx-auto max-w-2xl px-5 pb-36 pt-8 sm:px-6 sm:pb-16 sm:pt-12">
        {children}
      </main>
    </div>
  );
}
