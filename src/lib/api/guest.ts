import { PAYMENTS_OUTAGE, paymentsOutageError } from "@/lib/paymentsOutage";
import { apiFetch } from "./client";
import type {
  ChargeSavedCardResponse,
  DirectCardInput,
  InitiatePaymentInput,
  InitiatePaymentResponse,
  PaymentOrderDetail,
  PendingOrderChannel,
} from "./payments";
import type { TicketDetail } from "./tickets";

/**
 * Buying without an Allons account. The API knows the buyer from the body
 * and answers with a `guestToken`, the only thing that reads the order back,
 * plus a signed key per ticket once it is paid. Both live in this browser's
 * localStorage; the receipt mail carries the ticket links as a fallback.
 */

export interface GuestBuyer {
  name: string;
  email: string;
  phone?: string | null;
}

export interface GuestInitiateResponse extends InitiatePaymentResponse {
  guestToken: string;
  buyerEmail: string;
}

export interface GuestChargeResponse extends ChargeSavedCardResponse {
  guestToken: string;
  buyerEmail: string;
}

export interface GuestOrderDetail extends PaymentOrderDetail {
  buyerEmail: string | null;
  /** The hosted form, to resume a link order. Null on a card charge. */
  paymentLink: string | null;
  channel: PendingOrderChannel;
  /** Paid tickets with the key that opens each one without a session. */
  tickets: Array<{ id: string; key: string | null }>;
}

/** Sent with every guest request when the site has Turnstile; null otherwise. */
export interface GuestProof {
  turnstileToken?: string | null;
}

/** The API paused guest card charges (too many declines): pay on the hosted form. */
export const GUEST_CARD_PAUSED_CODE = "guest_card_paused";

export function guestInitiatePayment(
  input: InitiatePaymentInput & { buyer: GuestBuyer } & GuestProof,
) {
  if (PAYMENTS_OUTAGE) return Promise.reject(paymentsOutageError());
  return apiFetch<GuestInitiateResponse>("/guest/checkout/initiate", {
    method: "POST",
    body: input,
    auth: false,
  });
}

export function guestChargeWithCard(
  input: InitiatePaymentInput & { buyer: GuestBuyer; card: DirectCardInput } & GuestProof,
) {
  if (PAYMENTS_OUTAGE) return Promise.reject(paymentsOutageError());
  return apiFetch<GuestChargeResponse>("/guest/checkout/card", {
    method: "POST",
    body: input,
    auth: false,
  });
}

export function getGuestOrder(orderId: string, token: string) {
  return apiFetch<GuestOrderDetail>(
    `/guest/checkout/orders/${encodeURIComponent(orderId)}`,
    { auth: false, headers: { "x-guest-token": token } },
  );
}

export function cancelGuestOrder(orderId: string, token: string) {
  return apiFetch<{ orderId: string; status: "cancelled" }>(
    `/guest/checkout/orders/${encodeURIComponent(orderId)}/cancel`,
    { method: "POST", auth: false, headers: { "x-guest-token": token } },
  );
}

export function getGuestTicket(ticketId: string, key: string) {
  return apiFetch<TicketDetail>(
    `/guest/tickets/${encodeURIComponent(ticketId)}?k=${encodeURIComponent(key)}`,
    { auth: false },
  );
}

export const guestKeys = {
  order: (id: string) => ["guest", "orders", id] as const,
  ticket: (id: string, key: string) => ["guest", "tickets", id, key] as const,
};

// ---------------------------------------------------------------------------
// What the browser remembers for a guest
// ---------------------------------------------------------------------------

/** A guest order outlives the tab: the return from the bank lands in a fresh one. */
const ORDER_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export interface StoredGuestOrder {
  token: string;
  eventId: string | null;
  email: string | null;
  at: number;
}

function orderKey(orderId: string) {
  return `allons.guest.order.${orderId}`;
}

export function rememberGuestOrder(
  orderId: string,
  order: Omit<StoredGuestOrder, "at">,
) {
  try {
    window.localStorage.setItem(
      orderKey(orderId),
      JSON.stringify({ ...order, at: Date.now() } satisfies StoredGuestOrder),
    );
  } catch {
    /* private mode: the receipt mail still has the ticket */
  }
}

export function readGuestOrder(orderId: string): StoredGuestOrder | null {
  try {
    const raw = window.localStorage.getItem(orderKey(orderId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredGuestOrder;
    if (typeof parsed.token !== "string" || Date.now() - parsed.at > ORDER_TTL_MS) {
      window.localStorage.removeItem(orderKey(orderId));
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function forgetGuestOrder(orderId: string) {
  try {
    window.localStorage.removeItem(orderKey(orderId));
  } catch {
    /* nothing to clear */
  }
}

const BUYER_KEY = "allons.guest.buyer";

/**
 * Name and email of the last guest purchase, so the next checkout on this
 * device starts filled in. Never the national id or a card.
 */
export function rememberGuestBuyer(buyer: GuestBuyer) {
  try {
    window.localStorage.setItem(
      BUYER_KEY,
      JSON.stringify({ name: buyer.name, email: buyer.email }),
    );
  } catch {
    /* they type it again */
  }
}

export function readGuestBuyer(): GuestBuyer | null {
  try {
    const raw = window.localStorage.getItem(BUYER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<GuestBuyer>;
    if (typeof parsed.name !== "string" || typeof parsed.email !== "string") return null;
    return { name: parsed.name, email: parsed.email };
  } catch {
    return null;
  }
}
