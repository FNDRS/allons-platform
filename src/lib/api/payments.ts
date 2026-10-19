import type { QueryClient } from "@tanstack/react-query";
import { PAYMENTS_OUTAGE, paymentsOutageError } from "@/lib/paymentsOutage";
import { apiFetch, isApiError } from "./client";
import type { AnswerInput } from "./tickets";

export type PaymentOrderStatus =
  | "pending_payment"
  | "paid"
  | "failed"
  | "cancelled"
  | "refunded";

export interface PaymentHolderInput {
  name: string;
  email: string;
  invite: boolean;
  answers: AnswerInput[];
}

export interface InitiatePaymentInput {
  eventId: string;
  entryTypeId: string;
  quantity: number;
  holders: PaymentHolderInput[];
  answers: AnswerInput[];
  donationCents?: number;
  /** Código promocional del comercio (`provider_discounts`); rebaja el precio del boleto. */
  discountCode?: string | null;
  /** Campaigns whose hub the buyer agreed may see attendee data. */
  consentedCampaignIds?: string[];
  resourceIds?: string[] | null;
  /**
   * Buyer's national id, forwarded to Clinpays when its RedirectLink opens
   * the hosted form. The API never stores it and answers
   * `government_id_required` when it is needed and missing.
   */
  governmentId?: string | null;
}

export interface InitiatePaymentResponse {
  orderId: string;
  /** Null when a 100%-off code left nothing to charge: the order settles without a gateway. */
  paymentLink: string | null;
  amountCents: number;
  currency: string;
  expiresAt: string | null;
  discount: { cents: number } | null;
}

export interface PaymentOrderDetail {
  orderId: string;
  status: PaymentOrderStatus;
  amountCents: number;
  currency: string;
  orderType: string;
  ticketIds: string[];
  eventId: string | null;
  /** Passes a paid `class_package` order created. */
  classPassIds?: string[];
  classPackageId?: string | null;
  classProgramId?: string | null;
  expiresAt: string | null;
}

/** A class package order rather than event tickets. */
export function isClassPackageOrder(order: Pick<PaymentOrderDetail, "orderType">) {
  return order.orderType === "class_package";
}

/** What a paid order delivered: its tickets, or the passes of a class package. */
export function deliveredIds(order: PaymentOrderDetail): string[] {
  return isClassPackageOrder(order) ? (order.classPassIds ?? []) : order.ticketIds;
}

export interface ChargeSavedCardInput extends InitiatePaymentInput {
  paymentMethodId: string;
}

export interface ChargeSavedCardResponse {
  orderId: string;
  /**
   * `pending` when the bank asked for 3DS: show `redirectData`, then poll the
   * order. `paid` and `failed` are final.
   */
  status: "paid" | "failed" | "pending";
  /** The bank's 3DS window (HTML with script). Null unless pending. */
  redirectData: string | null;
  /** False when the charge went through but the tickets are still being issued. */
  fulfilled: boolean;
  amountCents: number;
  currency: string;
  discount: { cents: number } | null;
}

export function initiatePayment(input: InitiatePaymentInput) {
  if (PAYMENTS_OUTAGE) return Promise.reject(paymentsOutageError());
  return apiFetch<InitiatePaymentResponse>("/me/payments/initiate", {
    method: "POST",
    body: input,
  });
}

/** The card typed at checkout, charged once and never saved. */
export interface DirectCardInput {
  cardholderName: string;
  cardNumber: string;
  expMonth: number;
  expYear: number;
  cvv: string;
}

/**
 * Pays with the card typed at checkout, without saving it. Answers like a
 * saved-card charge, `pending` with the bank's 3DS window included.
 */
export function chargeWithCard(input: InitiatePaymentInput & { card: DirectCardInput }) {
  if (PAYMENTS_OUTAGE) return Promise.reject(paymentsOutageError());
  return apiFetch<ChargeSavedCardResponse>("/me/payments/card", {
    method: "POST",
    body: input,
  });
}

/** Pays with a card already in Paygate's vault. Only the card id travels. */
export function chargeWithSavedCard(input: ChargeSavedCardInput) {
  if (PAYMENTS_OUTAGE) return Promise.reject(paymentsOutageError());
  return apiFetch<ChargeSavedCardResponse>("/me/payments/charge", {
    method: "POST",
    body: input,
  });
}

/** The API refused a new checkout because the buyer's own one is still open. */
export const PENDING_ORDER_EXISTS_CODE = "pending_order_exists";

/**
 * How an open checkout is paid. A `card` charge waits on the bank's 3DS
 * answer and cannot be resumed; a `link` is a payment form still open.
 */
export type PendingOrderChannel = "card" | "link";

export interface ActivePaymentOrder {
  orderId: string;
  /** Empty when the API could not read the link back from Paygate. */
  paymentLink: string;
  expiresAt: string | null;
  /** Missing on an API that predates it; an empty link then means unknown. */
  channel?: PendingOrderChannel;
}

/**
 * Records the open checkout a refused order named, so the reserve page shows
 * the notice for it. True only when that notice is now sure to show, so the
 * caller can drop the error; otherwise the API's message still has to.
 */
export function rememberPendingOrder(
  queryClient: QueryClient,
  eventId: string,
  err: unknown,
): boolean {
  if (!isApiError(err) || err.code !== PENDING_ORDER_EXISTS_CODE) return false;
  const details = err.details ?? {};
  const orderId = typeof details.orderId === "string" ? details.orderId : null;
  const expiresAt = typeof details.expiresAt === "string" ? details.expiresAt : null;
  const lapsed = expiresAt !== null && new Date(expiresAt).getTime() <= Date.now();
  if (details.channel === "card" && orderId && !lapsed) {
    // A card charge has no link to read back: the refusal says all the
    // notice needs.
    queryClient.setQueryData<ActivePaymentOrder>(paymentKeys.active(eventId), {
      orderId,
      paymentLink: "",
      expiresAt,
      channel: "card",
    });
    return true;
  }
  // A link order is asked again so the notice gets the link to resume, which
  // also covers a checkout started in another tab. The lookup may still come
  // back empty (a lapsed order the sweep has not closed), so the error stays.
  void queryClient.invalidateQueries({ queryKey: paymentKeys.active(eventId) });
  return false;
}

/** The buyer's open checkout on this event, or null when there is none. */
export async function getActivePaymentOrder(
  eventId: string,
): Promise<ActivePaymentOrder | null> {
  try {
    return await apiFetch<ActivePaymentOrder>(
      `/me/payments/orders/active?eventId=${encodeURIComponent(eventId)}`,
    );
  } catch (err) {
    if (isApiError(err) && err.status === 404) return null;
    throw err;
  }
}

export function getPaymentOrder(orderId: string) {
  return apiFetch<PaymentOrderDetail>(
    `/me/payments/orders/${encodeURIComponent(orderId)}`,
  );
}

export const paymentKeys = {
  order: (id: string) => ["me", "payments", "orders", id] as const,
  active: (eventId: string) =>
    ["me", "payments", "orders", "active", eventId] as const,
};

/** sessionStorage key where the reserve step keeps the hosted-page link. */
export function paymentLinkStorageKey(orderId: string) {
  return `allons.paymentLink.${orderId}`;
}

/** The `/pagar` page for an order whose hosted form is still open. */
export function payOrderHref(orderId: string, eventId: string, link: string) {
  return `/pagar/${encodeURIComponent(orderId)}?link=${encodeURIComponent(link)}&event=${encodeURIComponent(eventId)}`;
}
