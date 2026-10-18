"use client";

import Link from "next/link";
import { ArrowLeft, Lock } from "lucide-react";
import { useClassPackageCheckout } from "@/hooks/useClassPackageCheckout";
import { formatHNL } from "@/lib/format";
import { PaymentMethodStep } from "@/components/pay/PaymentMethodStep";
import { StepHeading } from "@/components/reserve/ReserveSections";
import { Button, buttonClass } from "@/components/ui/Button";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/States";
import { ClassPackageSummary } from "./ClassPackageSummary";

/** Checkout for one paid class package: summary, card, pay. */
export function ClassCheckoutView({
  programId,
  packageId,
}: {
  programId: string;
  packageId: string;
}) {
  const state = useClassPackageCheckout(programId, packageId);
  const back = `/clases/${encodeURIComponent(programId)}`;

  if (state.loading) {
    return (
      <div className="flex flex-col gap-5">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-32" />
        <Skeleton className="h-40" />
      </div>
    );
  }
  if (state.error) {
    return <ErrorState message={state.error.message} onRetry={state.refetch} />;
  }
  if (!state.program || !state.item || !state.paid) {
    return (
      <EmptyState
        title="Este paquete ya no está a la venta"
        body="Vuelve a la clase para ver los paquetes disponibles."
        action={
          <Link href={back} className={buttonClass({ variant: "secondary" })}>
            Ver la clase
          </Link>
        }
      />
    );
  }

  const price = formatHNL(Number(state.item.price));

  return (
    <div className="flex flex-col gap-7 pb-36">
      <Link
        href={back}
        className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-muted hover:text-white"
      >
        <ArrowLeft className="size-4" aria-hidden /> {state.program.title}
      </Link>

      <h1 className="break-words text-[28px] font-bold leading-[1.05] tracking-[-0.03em] sm:text-[36px]">
        Comprar paquete
      </h1>

      <section>
        <StepHeading n={1}>Tu compra</StepHeading>
        <ClassPackageSummary programTitle={state.program.title} item={state.item} />
      </section>

      <PaymentMethodStep step={2} checkout={state.checkout} />

      {state.payError ? <ErrorState message={state.payError} /> : null}

      <p className="text-center text-[12px] leading-relaxed text-white/45">
        Al pagar aceptas los{" "}
        <Link href="/terminos" target="_blank" className="underline underline-offset-2 hover:text-white">
          Términos y Condiciones
        </Link>
        , la{" "}
        <Link href="/reembolsos" target="_blank" className="underline underline-offset-2 hover:text-white">
          Política de Reembolsos
        </Link>{" "}
        y la{" "}
        <Link href="/privacidad" target="_blank" className="underline underline-offset-2 hover:text-white">
          Política de Privacidad
        </Link>{" "}
        de Allons.
      </p>

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 px-4 pb-[max(14px,env(safe-area-inset-bottom))] sm:px-6">
        <div className="pointer-events-auto mx-auto flex max-w-2xl items-center gap-2 rounded-[28px] border border-white/10 bg-[#0a0a0b]/80 p-2 pl-4 shadow-[0_-20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:gap-3 sm:p-2.5 sm:pl-5">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-white/40">Total</p>
            <p className="truncate text-[18px] font-bold tracking-tight">{price}</p>
          </div>
          <Button
            size="lg"
            loading={state.submitting}
            onClick={state.pay}
            className="min-w-0 !shrink shadow-[0_10px_40px_rgba(246,112,16,0.28)] sm:min-w-[11.5rem] sm:!shrink-0"
          >
            {state.payInApp ? `Pagar ${price}` : "Ir a pagar"}
          </Button>
        </div>
        <p className="mx-auto mt-2 flex max-w-2xl items-center justify-center gap-1.5 text-[11px] text-white/30">
          <Lock className="size-3" strokeWidth={1.75} aria-hidden />
          {state.payInApp ? "Cifrado y procesado por Paygate (Clinpays)" : "Pago seguro en Paygate"}
        </p>
      </div>
    </div>
  );
}
