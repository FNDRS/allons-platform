/**
 * Messages between the checkout, the page that hosts the bank's 3DS window
 * (`/pagar/:orderId/verificar`) and the bank's return page. None carries a
 * decision: the order's outcome is always read from the API.
 */

/** Hosting page to checkout: framed and listening, send the bank's HTML. */
export const THREE_DS_READY = "allons:3ds-ready";
/** Checkout to hosting page: the bank's HTML for that order. */
export const THREE_DS_HTML = "allons:3ds-html";
/** Return page to checkout: the bank sent the buyer back. */
export const THREE_DS_DONE = "allons:3ds-done";

/**
 * Flags for the frame that runs the bank's HTML. No `allow-same-origin`: the
 * document gets an opaque origin, so its scripts cannot reach the checkout,
 * its storage or the session. No top navigation either.
 */
export const THREE_DS_SANDBOX =
  "allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox";

export interface ThreeDsMessage {
  type: string;
  orderId: string;
  html?: string;
}

export function readThreeDsMessage(data: unknown): ThreeDsMessage | null {
  if (!data || typeof data !== "object") return null;
  const { type, orderId, html } = data as Record<string, unknown>;
  if (typeof type !== "string" || typeof orderId !== "string") return null;
  return { type, orderId, ...(typeof html === "string" ? { html } : {}) };
}

/**
 * Whether `source` is `root` or any frame nested inside it. A sandboxed
 * sender has an opaque origin, so where it sits is what proves it is ours.
 * `frames` and `length` stay readable across origins.
 */
export function isWithinFrame(
  source: MessageEventSource | null,
  root: Window | null | undefined,
): boolean {
  if (!source || !root) return false;
  const stack: Window[] = [root];
  let visited = 0;
  while (stack.length > 0 && visited < 64) {
    const current = stack.pop() as Window;
    visited += 1;
    if (current === source) return true;
    for (let index = 0; index < current.length; index += 1) {
      stack.push(current.frames[index]);
    }
  }
  return false;
}
