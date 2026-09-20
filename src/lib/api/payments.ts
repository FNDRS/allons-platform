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

export function initiatePayment(input: InitiatePaymentInput) {
  return apiFetch<InitiatePaymentResponse>("/me/payments/initiate", {
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
