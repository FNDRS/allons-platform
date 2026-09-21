import Link from "next/link";
import { AllonsLogo } from "@/components/AllonsLogo";
import { glassCtaClass } from "@/components/ui/cta";

export default function NotFoundPage() {
  return (
    <main className="relative flex min-h-dvh overflow-hidden bg-[#050505] px-5 py-8 text-white sm:px-8">
      <div className="absolute inset-x-[-25%] top-[-24%] h-[520px] rounded-full bg-[#f67010]/20 blur-[120px]" />
      <div className="absolute inset-x-[12%] top-16 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent" />

      <section className="relative z-10 mx-auto flex w-full max-w-xl flex-col items-center justify-center text-center">
        <AllonsLogo className="h-auto w-32 sm:w-40" />
        <p className="mt-12 text-xs font-semibold uppercase tracking-[0.35em] text-[#f67010]">
          Error 404
        </p>
        <h1 className="mt-5 text-5xl font-semibold leading-[0.92] tracking-[-0.07em] text-white sm:text-7xl">
          Esta página no existe.
        </h1>
        <p className="mt-5 max-w-md text-base leading-7 tracking-tight text-white/58 sm:text-lg">
          El enlace pudo cambiar o estar incompleto. Vuelve al inicio para unirte
          a la lista de espera de Allons.
        </p>
        <Link
          href="/"
          className={`mt-9 inline-flex items-center justify-center px-7 py-4 text-sm ${glassCtaClass}`}
        >
          Volver al inicio
        </Link>
      </section>
    </main>
  );
}
