import type { Metadata } from "next";
import { ThreeDsReturn } from "@/components/pay/ThreeDsReturn";

export const metadata: Metadata = {
  title: "Verificación del banco",
  robots: { index: false, follow: false },
};

export default async function ThreeDsReturnPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  return <ThreeDsReturn orderId={orderId} />;
}
