import type { Metadata } from "next";
import { AppShell } from "@/components/app/AppShell";
import { ClassCheckoutView } from "@/components/classes/ClassCheckoutView";

export const metadata: Metadata = {
  title: "Comprar paquete",
  robots: { index: false, follow: false },
};

export default async function ClassCheckoutPage({
  params,
}: {
  params: Promise<{ id: string; packageId: string }>;
}) {
  const { id, packageId } = await params;
  return (
    <AppShell width="narrow" bottomTabs={false}>
      <ClassCheckoutView programId={id} packageId={packageId} />
    </AppShell>
  );
}
