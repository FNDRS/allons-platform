import { THREE_DS_DONE } from "@/lib/threeDs";

/**
 * Where the bank's 3DS window sends the buyer back. It loads inside the
 * sandboxed frame, with an opaque origin where the app itself could not run,
 * so it is a bare page: it tells the checkout the bank is done, or, opened on
 * its own, goes to the order page. The outcome is read from the API either way.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> },
) {
  const { orderId } = await params;
  const origin = new URL(request.url).origin;
  // JSON inside <script>: `<` escaped so the id cannot close the tag.
  const data = (value: unknown) => JSON.stringify(value).replace(/</g, "\\u003c");
  const html = `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><title>Confirmando tu pago</title></head>
<body style="background:#fff;font-family:system-ui,sans-serif;text-align:center;padding:24px;color:#444">
<p>Confirmando tu pago…</p>
<script>
(function () {
  var message = { type: ${data(THREE_DS_DONE)}, orderId: ${data(orderId)} };
  if (window.top !== window.self) {
    window.top.postMessage(message, ${data(origin)});
  } else {
    window.location.replace(${data(`/pagar/${encodeURIComponent(orderId)}`)});
  }
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
