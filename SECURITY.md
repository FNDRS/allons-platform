# Seguridad

## Reportar una vulnerabilidad

Escribe a **soporte@allonsapp.com** con el asunto "Seguridad". No abras un
issue público. Acusamos recibo en un máximo de 5 días hábiles.

Las reglas del programa (alcance, qué no hacer y puerto seguro) están en
<https://allonsapp.com/seguridad#divulgacion-responsable> y el contacto
también se publica en `/.well-known/security.txt` (RFC 9116).

## Controles en este repo

- Cabeceras en `next.config.ts`: CSP (con `connect-src` cerrado a este sitio,
  Supabase y allons-api), HSTS, `X-Frame-Options`, `nosniff`,
  `Referrer-Policy`, `Permissions-Policy`, COOP.
- `SUPABASE_SERVICE_ROLE_KEY` solo en route handlers del servidor; nunca con
  prefijo `NEXT_PUBLIC_`.
- `/api/waitlist`: sólo acepta POST del mismo origen, valida y limita tamaño y
  frecuencia, y nunca sobrescribe un teléfono ya guardado.
- `/api/health` responde sólo `ok`/`error`, sin detalles internos.
- JSON-LD con datos de organizadores se serializa con `jsonLd()`
  (`src/lib/seo.ts`), que escapa `<`, `>` y `&`.
- Sentry con `sendDefaultPii: false` y sin session replay.
