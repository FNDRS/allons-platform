import { apiFetch } from "./client";

/** A saved card as the API returns it: masked by Paygate, never the PAN. */
export interface PaymentMethod {
  id: string;
  brand: string | null;
  safeIdentifier: string | null;
  /** MMYY */
  validThru: string | null;
  last4: string | null;
  isDefault: boolean;
  createdAt: string;
}

export interface PaymentMethodList {
  data: PaymentMethod[];
  enrollmentEnabled: boolean;
  /** True until the buyer has a Paygate customer; the first card needs a DNI. */
  needsIdNumber: boolean;
}

export interface EnrollCardInput {
  cardholderName: string;
  /** Digits only. */
  cardNumber: string;
  expMonth: number;
  expYear: number;
  cvv: string;
  idNumber?: string;
}

export const paymentMethodKeys = {
  list: ["me", "payment-methods"] as const,
};

export function listPaymentMethods() {
  return apiFetch<PaymentMethodList>("/me/payment-methods");
}

/**
 * The one request on the site that carries card data. It goes straight to
 * allons-api over TLS, which forwards it to Paygate's vault and answers with
 * the masked card; the values never touch storage, the URL or the query cache.
 */
export function enrollCard(input: EnrollCardInput) {
  return apiFetch<PaymentMethod>("/me/payment-methods", {
    method: "POST",
    body: input,
  });
}

export function removePaymentMethod(id: string) {
  return apiFetch<{ removed: true }>(
    `/me/payment-methods/${encodeURIComponent(id)}`,
    { method: "DELETE" },
  );
}
