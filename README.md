# allons-platform

El sitio de Allons en `allonsapp.com`: la landing con captura de correo por QR,
el cliente web de eventos y tickets, y el panel del comercio.

Se llamaba `allons-waitlist` cuando sólo era la landing. El repo en GitHub
todavía tiene ese nombre: se renombra a `FNDRS/allons-platform` cuando este
cambio se mergee, y GitHub deja redirigiendo el nombre viejo.

## Plataforma web (allonsapp.com/events)

Además de la landing, el sitio funciona como cliente web de Allons cuando la app
no está disponible. Todo habla directo con **allons-api** desde el navegador con
la sesión de Supabase (Bearer); no hay rutas `/api/*` propias para esto.

| Ruta | Qué hace |
| --- | --- |
| `/events` | Lista pública de eventos, con búsqueda y filtro por ciudad |
| `/events/{id}` | Detalle del evento + CTA de reserva (y enlace a la app) |
| `/events/{id}/reservar` | Checkout: tipo de entrada, asistentes, preguntas, aporte |
| `/pagar/{orderId}` | Abre el link de Paygate en otra pestaña y espera la confirmación |
| `/tickets`, `/tickets/{id}` | Mis tickets: QR, código `ALL-`, y elección de recurso (bici/asiento) |
| `/comercio` | Resumen del comercio: KPIs y eventos |
| `/comercio/events/{id}` | Ventas por tipo y por hora, pagos, mapa y editor de recursos |
| `/comercio/staff` | Invitar y desactivar staff |
| `/login` | Correo + contraseña (misma cuenta que la app) |

Requiere `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` en el
navegador y, opcionalmente, `NEXT_PUBLIC_ALLONS_API_URL`.

## Stack

- Next.js 16 (App Router, Turbopack)
- React 19
- Tailwind 4
- Supabase (tabla `waitlist`)
- Sentry para errores (sin DSN queda apagado)

## Setup rápido

```bash
cd allons-waitlist   # allons-platform después del rename
pnpm install
cp .env.example .env.local   # llena las 3 variables
pnpm dev
```

### 1. Variables de entorno

`.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

> El `SUPABASE_SERVICE_ROLE_KEY` solo se usa server-side en `/api/waitlist`. **Nunca** lo expongas con prefijo `NEXT_PUBLIC_`.

Opcional para enlaces compartidos y App Links:

```
APP_STORE_LINK=https://apps.apple.com/us/app/allons-eventos-honduras/id6780532182?uo=4
PLAY_STORE_LINK=https://play.google.com/store/apps/details?id=com.fndrs.allons
ANDROID_PACKAGE_NAME=com.fndrs.allons
ANDROID_SHA256_CERT_FINGERPRINTS=AA:BB:CC:DD:...
```

`ANDROID_SHA256_CERT_FINGERPRINTS` debe salir de Google Play App Signing. Sin ese valor, `/.well-known/assetlinks.json` responde `[]` y Android no verificará los App Links.

### 2. Crear la tabla en Supabase

Abre tu proyecto → **SQL Editor** → pega y corre `db/schema.sql`.

Crea:
- `public.waitlist` con columnas `email`, `source`, `referer`, `user_agent`, `ip`, `created_at`
- Índice único en `lower(email)` (un email solo se registra una vez)
- View `waitlist_by_source` para ver el conteo por QR/ubicación
- RLS encendido — solo el `service_role` (el server) puede leer/escribir

### 3. Deploy

Vercel:
```bash
vercel link
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add APP_STORE_LINK
vercel env add PLAY_STORE_LINK
vercel env add ANDROID_SHA256_CERT_FINGERPRINTS
vercel --prod
```

### 4. Enlaces compartidos y `.well-known`

- `/events/{id}` muestra una página de respaldo para quien abre un evento compartido sin tener la app.
- El botón principal intenta abrir `allons://events/{id}`.
- `/.well-known/apple-app-site-association` habilita `/verify`, `/tickets` y `/events` para iOS.
- `/.well-known/assetlinks.json` se genera desde `ANDROID_SHA256_CERT_FINGERPRINTS` para Android.

---

## Atribución por QR

La landing lee el query param `?src=`. El valor se guarda en la columna `source`.

URL → `https://allonsapp.com/?src=la20`
Insert → `{ email: "...", source: "la20" }`

### Generar los QRs

La generación de QRs se gestiona desde `allons-admin`, no desde este repo.
Usa la vista `/waitlist-qr` del panel admin o el script `pnpm run qr` en
`allons-admin`.

### Reglas para los slugs

- Solo `a-z`, `0-9`, `-`, `_`. Máx. 40 chars.
- El backend valida con regex; cualquier slug "raro" se guarda como `null` (= directo).
- Mantén el slug igual entre reprints de la misma ubicación.

---

## Ver quién vino de cada QR

En SQL Editor de Supabase:

```sql
-- Resumen agregado
select * from waitlist_by_source;

-- Detalle de la última semana, por ubicación
select source, email, created_at
from waitlist
where created_at > now() - interval '7 days'
order by created_at desc;

-- Conversión por día y por QR
select
  date_trunc('day', created_at) as day,
  coalesce(source, '(direct)') as source,
  count(*) as signups
from waitlist
group by 1, 2
order by 1 desc, 3 desc;
```

---

## Estructura

```
.
├── db/schema.sql                  # corre esto en Supabase
├── public/                        # logo Allons
└── src/
    ├── app/
    │   ├── api/waitlist/route.ts  # POST endpoint (server-side, service_role)
    │   ├── page.tsx               # landing
    │   ├── layout.tsx
    │   └── globals.css
    ├── components/
    │   ├── AllonsLogo.tsx
    │   └── WaitlistForm.tsx       # CTA → email → submit
    └── lib/
        └── supabase-server.ts     # admin client
```
