import type { Metadata } from "next";
import { Suspense } from "react";
import { AppShell } from "@/components/app/AppShell";
import { LoginForm } from "@/components/app/LoginForm";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "Iniciar sesión",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <AppShell bottomTabs={false}>
      <div className="grid items-center gap-10 pt-4 lg:min-h-[70vh] lg:grid-cols-[1.1fr_1fr] lg:gap-16 lg:pt-8">
        <section className="relative">
          <h1 className="text-[28px] font-bold leading-[1.02] tracking-[-0.03em] sm:text-[56px] lg:text-[64px]">
            Tus eventos,
            <br />
            sin fricción.
          </h1>
          <p className="mt-5 max-w-md text-[16px] leading-relaxed text-muted">
            Compra tus entradas, guarda tu QR y elige tu lugar desde cualquier navegador. La misma
            cuenta que usas en la app.
          </p>
          <ul className="mt-8 hidden gap-6 text-[13px] font-semibold text-dim lg:flex">
            <li>Pago seguro con Paygate</li>
            <li>QR listo al instante</li>
            <li>Eventos en toda Honduras</li>
          </ul>
        </section>
        <Card padding="lg" className="w-full lg:max-w-[440px] lg:justify-self-end">
          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>
        </Card>
      </div>
    </AppShell>
  );
}
