import { THREE_DS_RETURN_KEY_PREFIX, threeDsFallbackReturnHref } from "@/lib/threeDs";

/**
 * Where the bank's 3DS page sends the buyer back. It lands on the order page
 * the checkout stashed before handing the tab over, or on the plain order
 * page when nothing was stashed. The outcome is read from the API either
 * way. Should a bank load this inside a frame of its own, the top window is
 * sent instead.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> },
) {
  const { orderId } = await params;
  // JSON inside <script>: `<` escaped so the id cannot close the tag.
  const data = (value: unknown) => JSON.stringify(value).replace(/</g, "\\u003c");
  const html = `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><title>Confirmando tu pago</title></head>
<body style="background:#fff;font-family:system-ui,sans-serif;text-align:center;padding:24px;color:#444">
<p>Confirmando tu pago…</p>
<script>
(function () {
  var fallback = ${data(threeDsFallbackReturnHref(orderId))};
  var href = fallback;
  try {
    var stashed = window.sessionStorage.getItem(${data(`${THREE_DS_RETURN_KEY_PREFIX}${orderId}`)});
    // Only a same-origin path: a poisoned entry must not send the buyer away.
    if (stashed && stashed.charAt(0) === "/" && stashed.charAt(1) !== "/") href = stashed;
  } catch (e) {}
  var target = window;
  try { if (window.top && window.top !== window) target = window.top; } catch (e) {}
  try { target.location.replace(href); } catch (e) { window.location.replace(href); }
})();
</script>
</body></html>`;
  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

/** The docs describe the return with URL parameters; a bank that posts back lands the same way. */
export const POST = GET;
