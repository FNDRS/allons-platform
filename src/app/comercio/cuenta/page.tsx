import type { Metadata } from "next";
import { ComercioPageHeader } from "@/components/comercio/ComercioPageHeader";
import { ChangePasswordForm } from "@/components/comercio/ChangePasswordForm";

export const metadata: Metadata = {
  title: "Cuenta · Comercio",
  robots: { index: false, follow: false },
};

export default function AccountPage() {
  return (
    <>
      <ComercioPageHeader
        title="Cuenta"
        subtitle="Tu acceso al panel y a la app."
      />
      <ChangePasswordForm />
    </>
  );
}
