"use client";

import confetti from "canvas-confetti";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Check, Clock, Loader2, Mail, XCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/app/AuthProvider";
import { useCountdown } from "@/hooks/useCountdown";
import { usePaymentOrder } from "@/hooks/usePaymentOrder";
import {
  forgetGuestOrder,
  getGuestOrder,
  readGuestOrder,
  type GuestOrderDetail,
  type StoredGuestOrder,
} from "@/lib/api/guest";
import { isClassPackageOrder, paymentLinkStorageKey } from "@/lib/api/payments";
import { paidOutcomeFor, retryHrefFor } from "@/lib/paymentOrderLinks";
import { formatCents } from "@/lib/format";
import { dropBankHandoffCard } from "@/lib/threeDs";
import { Button, buttonClass } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ErrorState, Skeleton } from "@/components/ui/States";
import { AnotherSessionCard } from "./AnotherSessionCard";
import { GuestTicketsPanel } from "./GuestTicketsPanel";
import { PaygateModal } from "./PaygateModal";

/**
 * Hosts the Paygate (Clinpays) hosted page is served from. The checkout
 * link itself is on paygate.biz (`https://<env>.paygate.biz/checkout/<id>`);
 * the API host is paygatehn.com. A local run adds its own API, which serves
 * the simulated form.
 */
const PAYGATE_HOSTS = ["paygate.biz", "paygatehn.com", "clinpays.com"];
const LOCAL_HOSTS = ["localhost", "127.0.0.1"];

/**
 * The link only ever comes from the initiate call. The reserve step stores
 * it per order in sessionStorage; the query param is a fallback for a page
 * opened in another tab, and is honored only on a Paygate host so a crafted
 * URL cannot make this page open somewhere else.
 */
function trustedLink(orderId: string, fromQuery: string | null): string | null {
  return trustedCandidate([readStoredLink(orderId), fromQuery]);
}

/** The first candidate that is a payment form on a host we know. */
function trustedCandidate(candidates: Array<string | null | undefined>): string | null {
  for (const raw of candidates) {
    if (!raw) continue;
    try {
      const url = new URL(raw);
      const host = url.hostname.toLowerCase();
      const known = PAYGATE_HOSTS.some(
        (suffix) => host === suffix || host.endsWith(`.${suffix}`),
      );
      if (url.protocol === "https:" && known) return url.toString();
      // Only while developing: the simulated gateway lives on this machine.
      if (
        process.env.NODE_ENV === "development" &&
        LOCAL_HOSTS.includes(host) &&
        url.pathname.startsWith("/dev/paygate/")
      ) {
        return url.toString();
      }
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
  const params = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  // A guest order is read with the token this browser kept when it was
  // placed. `undefined` until localStorage has been looked at, so neither
  // the sign-in prompt nor the wrong endpoint fires on the first render.
  const [guest, setGuest] = useState<StoredGuestOrder | null | undefined>(undefined);
  useEffect(() => {
    setGuest(readGuestOrder(orderId));
  }, [orderId]);
  const guestToken = guest?.token ?? null;
  // An order placed as a guest answers to its token, even once the buyer
  // has signed in: the account does not own it until the claim runs. With
  // neither a token nor a session there is nothing to poll, and the page
  // says so below.
  const ready = !authLoading && guest !== undefined && (Boolean(user) || Boolean(guestToken));
  const [link, setLink] = useState<string | null>(null);
  useEffect(() => {
    setLink(trustedLink(orderId, params.get("link")));
  }, [orderId, params]);
  const eventId = params.get("event");
  // Clinpays devuelve al comprador aquí con el resultado de su formulario.
  // La orden manda igual (la confirma el webhook), pero la página ya sabe
  // qué decir mientras tanto. Con un resultado en mano el formulario no se
  // vuelve a ofrecer, ni tras un rechazo: ese intento pertenece a una orden
  // que el webhook está por cerrar, y pagar en él sería pagar una orden
  // cerrada. Un nuevo intento es una compra nueva desde el evento.
  const estado = params.get("estado");
  const returnedOk = estado === "exito";
  const returnedFailed = estado === "error";
  const { order, phase, error, resume } = usePaymentOrder(
    ready ? orderId : "",
    guestToken ? () => getGuestOrder(orderId, guestToken) : undefined,
  );
  const asGuest = Boolean(guestToken);
  // A guest resuming a link order in a new tab has no stored link; the
  // order carries the form's URL, checked against the same hosts.
  const orderLink = asGuest ? ((order as GuestOrderDetail | undefined)?.paymentLink ?? null) : null;
  useEffect(() => {
    if (link || !orderLink) return;
    setLink(trustedCandidate([orderLink]));
  }, [link, orderLink]);
  // A closed order needs no token any more. (`orderStatus` is read below.)
  const closedStatus =
    order && order.status !== "pending_payment" && order.status !== "paid" ? order.status : null;
  useEffect(() => {
    if (asGuest && closedStatus) forgetGuestOrder(orderId);
  }, [asGuest, orderId, closedStatus]);
  const countdown = useCountdown(order?.expiresAt);
  // A one-off card vaulted for a 3DS charge waited in the vault for the
  // bank's answer. The order is settled: let it go.
  const orderStatus = order?.status ?? null;
  useEffect(() => {
    if (!orderStatus || orderStatus === "pending_payment") return;
    dropBankHandoffCard(orderId);
  }, [orderId, orderStatus]);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const opened = useRef(false);
  const celebrated = useRef(false);

  useEffect(() => {
    if (!link || opened.current || estado) return;
    if (phase !== "waiting" && phase !== "still_pending") return;
    opened.current = true;
    setCheckoutOpen(true);
  }, [link, phase, estado]);

  useEffect(() => {
    if (phase !== "paid" || celebrated.current) return;
    celebrated.current = true;
    void confetti({ particleCount: 140, spread: 80, origin: { y: 0.6 }, colors: ["#f67010", "#ffffff", "#ffb27a"] });
  }, [phase]);

  if (!authLoading && guest !== undefined && !user && !guestToken) {
    return <NoAccessPanel orderId={orderId} eventId={eventId} />;
  }

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

  const retryHref = retryHrefFor(order, eventId);
  const forClass = order ? isClassPackageOrder(order) : false;

  if (phase === "paid" && order) {
    if (asGuest) {
      return (
        <GuestTicketsPanel
          order={order as GuestOrderDetail}
          eventId={order.eventId ?? eventId}
        />
      );
    }
    const outcome = paidOutcomeFor(order);
    return (
      <div className="flex flex-col items-center px-4 py-12 text-center sm:py-16">
        <span className="flex size-14 items-center justify-center rounded-[18px] bg-white/[0.04] ring-1 ring-white/12">
          <Check className="size-6 text-white/80" strokeWidth={1.6} aria-hidden />
        </span>
        <h1 className="mt-8 break-words text-[28px] font-bold tracking-[-0.04em] sm:text-[34px]">
          ¡Pago confirmado!
        </h1>
        <p className="mt-2 max-w-sm text-[14px] leading-relaxed text-white/50">
          Pagaste {formatCents(order.amountCents)}. {outcome.body}
        </p>
        <Link
          href={outcome.primary.href}
          className={buttonClass({ size: "lg", full: true, className: "mt-8 max-w-xs" })}
        >
          {outcome.primary.label}
        </Link>
        <Link href={outcome.secondary.href} className="mt-4 text-[13px] text-white/40 transition hover:text-white">
          {outcome.secondary.label}
        </Link>
        {order.eventId && !forClass ? (
          <AnotherSessionCard eventId={order.eventId} ticketId={order.ticketIds[0] ?? null} />
        ) : null}
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
        <Link
          href={retryHref}
          className={buttonClass({ size: "lg", full: true, variant: "secondary", className: "mt-7 max-w-xs" })}
        >
          Intentar de nuevo
        </Link>
      </Card>
    );
  }

  if (phase === "minting" || phase === "still_minting") {
    const stalled = phase === "still_minting";
    return (
      <Card className="flex flex-col items-center py-10 text-center">
        {stalled ? (
          <Clock className="size-12 text-accent" aria-hidden />
        ) : (
          <Loader2 className="size-12 animate-spin text-accent" aria-hidden />
        )}
        <h1 className="mt-5 break-words text-[24px] font-bold tracking-[-0.03em] sm:text-[26px]">
          {stalled
            ? forClass
              ? "Tus sesiones están tardando"
              : "Tu ticket está tardando"
            : forClass
              ? "Estamos agregando tus sesiones"
              : "Estamos emitiendo tu ticket"}
        </h1>
        <p className="mt-2 max-w-sm text-sm text-muted">
          {stalled
            ? asGuest
              ? "El pago entró y no se te cobrará de nuevo. Dejamos de revisar automáticamente; vuelve a revisar aquí o espera el correo con tu ticket."
              : "El pago entró y no se te cobrará de nuevo. Dejamos de revisar automáticamente; vuelve a revisar o búscalo en Mis tickets en un momento."
            : forClass
              ? "El pago entró. En unos segundos tus sesiones estarán listas para agendar; si tarda, revisa en un momento."
              : asGuest
                ? "El pago entró. En unos segundos aparece aquí tu ticket y también te lo enviamos por correo."
                : "El pago entró. En unos segundos aparecerá en Mis tickets; si tarda, revisa ahí en un momento."}
        </p>
        {stalled ? (
          <Button size="lg" onClick={resume} className="mt-7">
            Volver a revisar
          </Button>
        ) : null}
        {!asGuest ? (
          <Link
            href="/tickets"
            className={buttonClass({ variant: "secondary", className: stalled ? "mt-3" : "mt-7" })}
          >
            Ir a mis tickets
          </Link>
        ) : null}
      </Card>
    );
  }

  // waiting | still_pending. The card checkout sends `pago=tarjeta`: that
  // order has no Paygate link and only waits on the bank's 3DS answer. It only
  // changes the copy; the status still comes from the order.
  const byCard = params.get("pago") === "tarjeta" && !link && !estado;
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
                : byCard
                  ? "Confirmando tu pago"
                  : "Completa tu pago"}
        </h1>
        <p className="mt-2 text-sm text-muted">
          {returnedOk
            ? `Clinpays aprobó el cargo. En cuanto nos confirme, ${forClass ? "tus sesiones aparecen" : "tu ticket aparece"} aquí.`
            : returnedFailed
              ? `Clinpays no aprobó el cargo y no se cobró nada. En cuanto nos lo confirme podrás intentarlo de nuevo desde ${forClass ? "la clase" : "el evento"}.`
              : byCard
                ? `Tu banco está confirmando el cargo. ${forClass ? "Tus sesiones aparecen" : "Tu ticket aparece"} aquí en cuanto lo apruebe.`
                : `El pago es de Paygate (Clinpays). Se abre en su página; aquí confirmamos ${forClass ? "tus sesiones" : "el ticket"}.`}
        </p>
      </div>

      <Card className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted">Total</span>
          <span className="text-2xl font-bold tracking-tight">
            {order ? formatCents(order.amountCents) : "—"}
          </span>
        </div>
        {countdown && !byCard ? (
          <p className="text-sm text-dim">
            El enlace de pago vence en <span className="font-semibold text-white">{countdown}</span>
          </p>
        ) : null}
        {estado ? null : link ? (
          <Button size="lg" full onClick={() => setCheckoutOpen(true)}>
            {checkoutOpen ? "Pago en curso" : "Abrir pago"}
          </Button>
        ) : byCard ? null : (
          <p className="text-sm text-amber-200">
            No encontramos el enlace de pago. Vuelve al evento e inicia la compra otra vez.
          </p>
        )}
      </Card>

      <Card className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center">
        {phase === "waiting" ? (
          <>
            <Loader2 className="size-5 shrink-0 animate-spin text-accent" aria-hidden />
            <p className="text-sm text-muted">
              {byCard ? "Esperando la respuesta de tu banco…" : "Esperando la confirmación de Paygate…"}
            </p>
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
        {forClass ? "Cancelar y volver a la clase" : "Cancelar y volver al evento"}
      </Link>
    </div>
  );
}

/**
 * This browser has no way to read the order: no session, and no token
 * because the checkout started somewhere else. The receipt mail is the way
 * to the ticket; an account holder can also sign in.
 */
function NoAccessPanel({ orderId, eventId }: { orderId: string; eventId: string | null }) {
  const next = `/pagar/${encodeURIComponent(orderId)}${
    eventId ? `?event=${encodeURIComponent(eventId)}` : ""
  }`;
  return (
    <Card className="flex flex-col items-center py-10 text-center">
      <span className="flex size-14 items-center justify-center rounded-[18px] bg-white/[0.04] ring-1 ring-white/12">
        <Mail className="size-6 text-white/80" strokeWidth={1.6} aria-hidden />
      </span>
      <h1 className="mt-6 break-words text-[24px] font-bold tracking-[-0.03em] sm:text-[28px]">
        Tu ticket está en tu correo
      </h1>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted">
        Este pago se inició desde otro navegador o dispositivo. Si se completó, el
        ticket con su código QR ya llegó al correo que escribiste al comprar.
      </p>
      <Link
        href={`/login?next=${encodeURIComponent(next)}`}
        className={buttonClass({ size: "lg", variant: "secondary", className: "mt-7" })}
      >
        Tengo cuenta, iniciar sesión
      </Link>
      <Link href={eventId ? `/eventos/${encodeURIComponent(eventId)}` : "/eventos"} className="mt-4 text-[13px] text-white/40 transition hover:text-white">
        Volver al evento
      </Link>
    </Card>
  );
}
