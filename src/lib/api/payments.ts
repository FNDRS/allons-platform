import { apiFetch } from "./client";
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
  paymentLink: string;
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

export function getPaymentOrder(orderId: string) {
  return apiFetch<PaymentOrderDetail>(
    `/me/payments/orders/${encodeURIComponent(orderId)}`,
  );
}

export const paymentKeys = {
  order: (id: string) => ["me", "payments", "orders", id] as const,
};

/** sessionStorage key where the reserve step keeps the hosted-page link. */
export function paymentLinkStorageKey(orderId: string) {
  return `allons.paymentLink.${orderId}`;
}
