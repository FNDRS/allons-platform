import type { Metadata } from "next";
import { Suspense } from "react";
import { AppShell } from "@/components/app/AppShell";
import { LoginForm } from "@/components/app/LoginForm";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "Iniciar sesión",
  description: "Todos tus eventos en un solo lugar. Entra con tu cuenta Allons.",
  robots: { index: false, follow: false },
  openGraph: {
    title: "Allons",
    description: "Todos tus eventos en un solo lugar.",
  },
};

export default function LoginPage() {
  return (
    <AppShell bottomTabs={false} fit>
      <div className="grid min-w-0 items-center gap-10 pt-4 lg:pt-0 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-16">
        <section className="relative min-w-0">
          <h1 className="break-words text-[28px] font-bold leading-[1.02] tracking-[-0.03em] sm:text-[56px] lg:text-[64px]">
            Todos tus eventos
            <br />
            en un solo lugar.
          </h1>
          <p className="mt-5 max-w-md break-words text-[16px] leading-relaxed text-muted">
            Compra tus entradas, guarda tu QR y elige tu lugar desde cualquier navegador. La misma
            cuenta que usas en la app.
          </p>
          <ul className="mt-8 hidden gap-6 text-[13px] font-semibold text-dim lg:flex">
            <li>Pago seguro con Paygate</li>
            <li>QR listo al instante</li>
            <li>Eventos en toda Honduras</li>
          </ul>
        </section>
        <Card padding="lg" className="w-full min-w-0 lg:max-w-[440px] lg:justify-self-end">
          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>
        </Card>
      </div>
    </AppShell>
  );
}
