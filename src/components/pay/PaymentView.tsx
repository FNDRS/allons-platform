"use client";

import confetti from "canvas-confetti";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Check, Loader2, XCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useCountdown } from "@/hooks/useCountdown";
import { usePaymentOrder } from "@/hooks/usePaymentOrder";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { paymentLinkStorageKey } from "@/lib/api/payments";
import { formatCents } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ErrorState, Skeleton } from "@/components/ui/States";
import { PaygateModal } from "./PaygateModal";

/**
 * Hosts the Paygate (Clinpays) hosted page is served from. The checkout
 * link itself is on paygate.biz (`https://<env>.paygate.biz/checkout/<id>`);
 * the API host is paygatehn.com.
 */
const PAYGATE_HOSTS = ["paygate.biz", "paygatehn.com", "clinpays.com"];

/**
 * The link only ever comes from `POST /me/payments/initiate`. The reserve
 * step stores it per order in sessionStorage; the query param is a fallback
 * for a page opened in another tab, and is honored only on a Paygate host so
 * a crafted URL cannot make this page open somewhere else.
 */
function trustedLink(orderId: string, fromQuery: string | null): string | null {
  const candidates = [readStoredLink(orderId), fromQuery];
  for (const raw of candidates) {
    if (!raw) continue;
    try {
      const url = new URL(raw);
      const host = url.hostname.toLowerCase();
      const known = PAYGATE_HOSTS.some(
        (suffix) => host === suffix || host.endsWith(`.${suffix}`),
      );
      if (url.protocol === "https:" && known) return url.toString();
    } catch {
      /* try the next candidate */
    }
  }
  return null;
}

function readStoredLink(orderId: string): string | null {
  try {
    return window.sessionStorage.getItem(paymentLinkStorageKey(orderId));
  } catch {
    return null;
  }
}

export function PaymentView({ orderId }: { orderId: string }) {
  const { ready } = useRequireAuth();
  const params = useSearchParams();
  const [link, setLink] = useState<string | null>(null);
  useEffect(() => {
    setLink(trustedLink(orderId, params.get("link")));
  }, [orderId, params]);
  const eventId = params.get("event");
  // Clinpays devuelve al comprador aquí con el resultado de su formulario.
  // La orden manda igual (la confirma el webhook), pero la página ya sabe
  // qué decir mientras tanto y no vuelve a abrir el pago.
  const estado = params.get("estado");
  const returnedOk = estado === "exito";
  const returnedFailed = estado === "error";
  const { order, phase, error, resume } = usePaymentOrder(ready ? orderId : "");
  const countdown = useCountdown(order?.expiresAt);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const opened = useRef(false);
  const celebrated = useRef(false);

  useEffect(() => {
    if (!link || opened.current || estado) return;
    if (phase !== "waiting" && phase !== "still_pending") return;
    opened.current = true;
    setCheckoutOpen(true);
  }, [link, phase]);

  useEffect(() => {
    if (phase !== "paid" || celebrated.current) return;
    celebrated.current = true;
    void confetti({ particleCount: 140, spread: 80, origin: { y: 0.6 }, colors: ["#f67010", "#ffffff", "#ffb27a"] });
  }, [phase]);

  if (!ready || phase === "loading") {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-10 w-1/2" />
        <Skeleton className="h-48" />
      </div>
    );
  }
  if (phase === "error") {
    return <ErrorState message={error?.message} onRetry={resume} />;
  }

  const retryHref = eventId
    ? `/events/${encodeURIComponent(eventId)}/reservar`
    : "/events";

  if (phase === "paid" && order) {
    const ticketId = order.ticketIds[0];
    return (
      <div className="flex flex-col items-center px-4 py-12 text-center sm:py-16">
        <span className="flex size-14 items-center justify-center rounded-[18px] bg-white/[0.04] ring-1 ring-white/12">
          <Check className="size-6 text-white/80" strokeWidth={1.6} aria-hidden />
        </span>
        <h1 className="mt-8 break-words text-[28px] font-bold tracking-[-0.04em] sm:text-[34px]">
          ¡Pago confirmado!
        </h1>
        <p className="mt-2 max-w-sm text-[14px] leading-relaxed text-white/50">
          Pagaste {formatCents(order.amountCents)}. Tu ticket ya está en tu cuenta.
        </p>
        <Link href={`/tickets/${encodeURIComponent(ticketId)}?nuevo=1`} className="mt-8 w-full max-w-xs">
          <Button size="lg" full>Ver mi ticket</Button>
        </Link>
        <Link href="/tickets" className="mt-4 text-[13px] text-white/40 transition hover:text-white">
          Ir a mis tickets
        </Link>
      </div>
    );
  }

  if (phase === "failed") {
    return (
      <Card className="flex flex-col items-center py-10 text-center">
        <XCircle className="size-14 text-red-300" aria-hidden />
        <h1 className="mt-5 break-words text-[26px] font-bold tracking-[-0.03em] sm:text-[30px]">
          {order?.status === "cancelled" ? "Pago cancelado" : "El pago no se completó"}
        </h1>
        <p className="mt-2 max-w-sm text-sm text-muted">
          No se hizo ningún cargo. Puedes intentarlo de nuevo cuando quieras.
        </p>
        <Link href={retryHref} className="mt-7 w-full max-w-xs">
          <Button size="lg" full variant="secondary">Intentar de nuevo</Button>
        </Link>
      </Card>
    );
  }

  if (phase === "minting") {
    return (
      <Card className="flex flex-col items-center py-10 text-center">
        <Loader2 className="size-12 animate-spin text-accent" aria-hidden />
        <h1 className="mt-5 break-words text-[24px] font-bold tracking-[-0.03em] sm:text-[26px]">Estamos emitiendo tu ticket</h1>
        <p className="mt-2 max-w-sm text-sm text-muted">
          El pago entró. En unos segundos aparecerá en Mis tickets; si tarda, revisa ahí en un momento.
        </p>
        <Link href="/tickets" className="mt-7">
          <Button variant="secondary">Ir a mis tickets</Button>
        </Link>
      </Card>
    );
  }

  // waiting | still_pending
  return (
    <div className="flex flex-col gap-5">
      {link ? (
        <PaygateModal
          open={checkoutOpen}
          onClose={() => setCheckoutOpen(false)}
          src={link}
          amountLabel={order ? formatCents(order.amountCents) : undefined}
        />
      ) : null}

      <div>
        <h1 className="break-words text-[28px] font-bold leading-[1.05] tracking-[-0.03em] sm:text-[40px]">
          {returnedOk
            ? "Confirmando tu pago"
            : returnedFailed
              ? "El pago no se completó"
              : phase === "still_pending"
                ? "Tu pago sigue pendiente"
                : "Completa tu pago"}
        </h1>
        <p className="mt-2 text-sm text-muted">
          {returnedOk
            ? "Clinpays aprobó el cargo. En cuanto nos confirme, tu ticket aparece aquí."
            : returnedFailed
              ? "Clinpays no aprobó el cargo y no se cobró nada. Puedes volver a abrir el pago con otra tarjeta."
              : "El pago es de Paygate (Clinpays). Se abre en su página; aquí confirmamos el ticket."}
        </p>
      </div>

      <Card className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted">Total</span>
          <span className="text-2xl font-bold tracking-tight">
            {order ? formatCents(order.amountCents) : "—"}
          </span>
        </div>
        {countdown ? (
          <p className="text-sm text-dim">
            El enlace de pago vence en <span className="font-semibold text-white">{countdown}</span>
          </p>
        ) : null}
        {link ? (
          <Button size="lg" full onClick={() => setCheckoutOpen(true)}>
            {checkoutOpen ? "Pago en curso" : returnedFailed ? "Volver a abrir el pago" : "Abrir pago"}
          </Button>
        ) : returnedOk ? null : (
          <p className="text-sm text-amber-200">
            {returnedFailed
              ? "Vuelve al evento para iniciar la compra otra vez."
              : "No encontramos el enlace de pago. Vuelve al evento e inicia la compra otra vez."}
          </p>
        )}
      </Card>

      <Card className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center">
        {phase === "waiting" ? (
          <>
            <Loader2 className="size-5 shrink-0 animate-spin text-accent" aria-hidden />
            <p className="text-sm text-muted">Esperando la confirmación de Paygate…</p>
          </>
        ) : (
          <>
            <p className="min-w-0 flex-1 text-sm text-muted">
              Dejamos de revisar automáticamente. Si ya pagaste, vuelve a revisar.
            </p>
            <Button variant="secondary" size="sm" onClick={resume} className="self-start sm:self-auto">
              Volver a revisar
            </Button>
          </>
        )}
      </Card>

      <Link href={retryHref} className="text-center text-sm text-dim hover:text-white">
        Cancelar y volver al evento
      </Link>
    </div>
  );
}
