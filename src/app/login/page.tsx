import type { Metadata } from "next";
import { Suspense } from "react";
import { AppShell } from "@/components/app/AppShell";
import { LoginForm } from "@/components/app/LoginForm";

export const metadata: Metadata = {
  title: "Iniciar sesión",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <AppShell width="narrow">
      <div className="pt-6 sm:pt-12">
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>
    </AppShell>
  );
}
