import { removePaymentMethod } from "@/lib/api/paymentMethods";

/**
 * The bank's 3DS verification runs as a full-page navigation. The checkout
 * stashes the bank's HTML in sessionStorage and goes to
 * `/pagar/:orderId/verificar`, which writes it as the document. The bank's
 * page then owns the tab, and when it is done it sends the buyer back to
 * `/pagar/:orderId/3ds`, which lands on the order page. The outcome is always
 * read from the API, never from the browser.
 *
 * It used to run inside a sandboxed iframe. The step where the bank asks for
 * a code did not survive that: on iOS Safari it rendered as raw text, so
 * every real challenge ended as THREE_DS_ABANDONED while the frictionless
 * ones went through. Top level is how Clinpays' own hosted page runs it.
 */

const htmlKey = (orderId: string) => `allons-3ds:${orderId}`;
const cardKey = (orderId: string) => `allons-3ds-card:${orderId}`;
/** Read by the inline script of `/pagar/:orderId/3ds`; keep them in sync. */
export const THREE_DS_RETURN_KEY_PREFIX = "allons-3ds-return:";
const returnKey = (orderId: string) => `${THREE_DS_RETURN_KEY_PREFIX}${orderId}`;

export function threeDsVerifyHref(orderId: string): string {
  return `/pagar/${encodeURIComponent(orderId)}/verificar`;
}

/** Where the order page is when nothing better was stashed. */
export function threeDsFallbackReturnHref(orderId: string): string {
  return `/pagar/${encodeURIComponent(orderId)}?pago=tarjeta`;
}

/**
 * Hands the tab to the bank. Returns once the navigation is under way; the
 * caller must not touch the page again. Without sessionStorage the bank's
 * HTML is written over the current document instead, so the buyer still
 * gets the bank's page, just without the stashed return address.
 */
export function handOffToBank({
  orderId,
  html,
  returnHref,
  dropCardId,
}: {
  orderId: string;
  html: string;
  /** Same-origin path the bank's return lands on. */
  returnHref: string;
  /** A one-off card vaulted for this charge; the order page drops it after. */
  dropCardId: string | null;
}): void {
  let stashed = false;
  try {
    window.sessionStorage.setItem(htmlKey(orderId), html);
    window.sessionStorage.setItem(returnKey(orderId), returnHref);
    if (dropCardId) window.sessionStorage.setItem(cardKey(orderId), dropCardId);
    else window.sessionStorage.removeItem(cardKey(orderId));
    stashed = true;
  } catch {
    /* no storage: write in place below */
  }
  if (stashed) {
    window.location.assign(threeDsVerifyHref(orderId));
    return;
  }
  writeBankDocument(html);
}

/** The bank's HTML for this order, once. A reload or a back step finds none. */
export function takeBankHtml(orderId: string): string | null {
  try {
    const html = window.sessionStorage.getItem(htmlKey(orderId));
    window.sessionStorage.removeItem(htmlKey(orderId));
    return html;
  } catch {
    return null;
  }
}

/**
 * Replaces the current document with the bank's page. Scripts written this
 * way run, which is what submits the bank's form.
 */
export function writeBankDocument(html: string): void {
  document.open();
  document.write(html);
  document.close();
}

/**
 * Drops the one-off card vaulted for a 3DS charge, once the order is no
 * longer pending. Best effort: the vault is Paygate's, and a card left
 * behind is a nuisance, not a charge.
 */
export function dropBankHandoffCard(orderId: string): void {
  let cardId: string | null = null;
  try {
    cardId = window.sessionStorage.getItem(cardKey(orderId));
    window.sessionStorage.removeItem(cardKey(orderId));
    window.sessionStorage.removeItem(returnKey(orderId));
  } catch {
    return;
  }
  if (!cardId) return;
  void removePaymentMethod(cardId).catch(() => removePaymentMethod(cardId as string)).catch(() => {});
}
