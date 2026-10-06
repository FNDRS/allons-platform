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
  expiresAt: string | null;
}

export interface ChargeSavedCardInput extends InitiatePaymentInput {
  paymentMethodId: string;
}

export interface ChargeSavedCardResponse {
  orderId: string;
  /** Terminal already: a stored-card charge settles synchronously. */
  status: "paid" | "failed";
  /** False when the charge went through but the tickets are still being issued. */
  fulfilled: boolean;
  amountCents: number;
  currency: string;
  discount: { cents: number } | null;
}

export function initiatePayment(input: InitiatePaymentInput) {
  return apiFetch<InitiatePaymentResponse>("/me/payments/initiate", {
    method: "POST",
    body: input,
  });
}

/** Pays with a card already in Paygate's vault. Only the card id travels. */
export function chargeWithSavedCard(input: ChargeSavedCardInput) {
  return apiFetch<ChargeSavedCardResponse>("/me/payments/charge", {
    method: "POST",
    body: input,
  });
}

/** The API refused a new checkout because the buyer's own one is still open. */
export const PENDING_ORDER_EXISTS_CODE = "pending_order_exists";

export interface ActivePaymentOrder {
  orderId: string;
  /** Empty when the API could not read the link back from Paygate. */
  paymentLink: string;
  expiresAt: string | null;
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
