import type { Metadata } from "next";
import { ThreeDsFrame } from "@/components/pay/ThreeDsFrame";

export const metadata: Metadata = {
  title: "Verificación del banco",
  robots: { index: false, follow: false },
};

export default async function ThreeDsVerifyPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  return <ThreeDsFrame orderId={orderId} />;
}
