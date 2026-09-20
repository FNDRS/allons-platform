"use client";

import confetti from "canvas-confetti";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, ExternalLink, Loader2, XCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useCountdown } from "@/hooks/useCountdown";
import { usePaymentOrder } from "@/hooks/usePaymentOrder";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { paymentLinkStorageKey } from "@/lib/api/payments";
import { formatCents } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ErrorState, Skeleton } from "@/components/ui/States";

/** Hosts the Paygate (Clinpays) hosted page is served from. */
const PAYGATE_HOSTS = ["paygatehn.com", "clinpays.com"];

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
  const { order, phase, error, resume } = usePaymentOrder(ready ? orderId : "");
  const countdown = useCountdown(order?.expiresAt);
  const [popupBlocked, setPopupBlocked] = useState(false);
  const opened = useRef(false);
  const celebrated = useRef(false);

  // One automatic attempt; browsers often block it, so the button stays.
  useEffect(() => {
    if (!link || opened.current || phase !== "waiting") return;
    opened.current = true;
    const win = window.open(link, "_blank", "noopener");
    if (!win) setPopupBlocked(true);
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
      <Card className="flex flex-col items-center py-10 text-center">
        <CheckCircle2 className="size-14 text-accent" aria-hidden />
        <h1 className="mt-5 text-3xl font-semibold tracking-[-0.04em]">¡Pago confirmado!</h1>
        <p className="mt-2 text-sm text-white/60">
          Pagaste {formatCents(order.amountCents)}. Tu ticket ya está en tu cuenta.
        </p>
        <Link href={`/tickets/${encodeURIComponent(ticketId)}?nuevo=1`} className="mt-7 w-full max-w-xs">
          <Button size="lg" full>Ver mi ticket</Button>
        </Link>
        <Link href="/tickets" className="mt-3 text-sm text-white/55 hover:text-white">
          Ir a mis tickets
        </Link>
      </Card>
    );
  }

  if (phase === "failed") {
    return (
      <Card className="flex flex-col items-center py-10 text-center">
        <XCircle className="size-14 text-red-300" aria-hidden />
        <h1 className="mt-5 text-3xl font-semibold tracking-[-0.04em]">
          {order?.status === "cancelled" ? "Pago cancelado" : "El pago no se completó"}
        </h1>
        <p className="mt-2 max-w-sm text-sm text-white/60">
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
        <h1 className="mt-5 text-2xl font-semibold tracking-tight">Estamos emitiendo tu ticket</h1>
        <p className="mt-2 max-w-sm text-sm text-white/60">
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
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">Pago</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">
          {phase === "still_pending" ? "Tu pago sigue pendiente" : "Completa tu pago"}
        </h1>
        <p className="mt-2 text-sm text-white/60">
          Tu pago se abre en Paygate (Clinpays), la pasarela segura. Cuando termines, vuelve a
          esta pestaña: aquí confirmamos el ticket.
        </p>
      </div>

      <Card className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-white/60">Total</span>
          <span className="text-2xl font-bold tracking-tight">
            {order ? formatCents(order.amountCents) : "—"}
          </span>
        </div>
        {countdown ? (
          <p className="text-sm text-white/50">
            El enlace de pago vence en <span className="font-semibold text-white">{countdown}</span>
          </p>
        ) : null}
        {link ? (
          <a href={link} target="_blank" rel="noopener noreferrer" className="block">
            <Button size="lg" full onClick={() => setPopupBlocked(false)}>
              Pagar ahora <ExternalLink className="size-4" />
            </Button>
          </a>
        ) : (
          <p className="text-sm text-amber-200">
            No encontramos el enlace de pago. Vuelve al evento e inicia la compra otra vez.
          </p>
        )}
        {popupBlocked ? (
          <p className="text-xs text-white/45">
            Tu navegador bloqueó la ventana automática. Usa el botón para abrir el pago.
          </p>
        ) : null}
      </Card>

      <Card className="flex items-center gap-3 py-4">
        {phase === "waiting" ? (
          <>
            <Loader2 className="size-5 shrink-0 animate-spin text-accent" aria-hidden />
            <p className="text-sm text-white/65">Esperando la confirmación de Paygate…</p>
          </>
        ) : (
          <>
            <p className="flex-1 text-sm text-white/65">
              Dejamos de revisar automáticamente. Si ya pagaste, vuelve a revisar.
            </p>
            <Button variant="secondary" size="sm" onClick={resume}>
              Volver a revisar
            </Button>
          </>
        )}
      </Card>

      <Link href={retryHref} className="text-center text-sm text-white/45 hover:text-white">
        Cancelar y volver al evento
      </Link>
    </div>
  );
}
