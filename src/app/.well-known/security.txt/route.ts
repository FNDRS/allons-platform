/**
 * RFC 9116: where a researcher reports a vulnerability. `Expires` is required
 * and must be under a year out, so it is computed instead of hard-coded and
 * can never go stale.
 */
export function GET() {
  const expires = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000);
  expires.setUTCHours(0, 0, 0, 0);

  const body = [
    "Contact: mailto:soporte@allonsapp.com",
    `Expires: ${expires.toISOString()}`,
    "Preferred-Languages: es, en",
    "Canonical: https://allonsapp.com/.well-known/security.txt",
    "Policy: https://allonsapp.com/seguridad#divulgacion-responsable",
    "",
  ].join("\n");

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
