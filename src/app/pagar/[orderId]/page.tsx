import type { Metadata } from "next";
import { Suspense } from "react";
import { AppShell } from "@/components/app/AppShell";
import { PaymentView } from "@/components/pay/PaymentView";

export const metadata: Metadata = {
  title: "Pago",
  robots: { index: false, follow: false },
};

export default async function PayPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  return (
    <AppShell width="narrow">
      <Suspense fallback={null}>
        <PaymentView orderId={orderId} />
      </Suspense>
    </AppShell>
  );
}
