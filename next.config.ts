import { withSentryConfig } from "@sentry/nextjs/config";
import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

/** Origins as CSP sources; a bad or missing env value is just left out. */
function originOf(raw: string | undefined): string | null {
  try {
    return raw?.trim() ? new URL(raw.trim()).origin : null;
  } catch {
    return null;
  }
}

/**
 * The CSP is mostly about `connect-src`: the checkout form holds a card
 * number, so the only places a script on this page may send data are this
 * site (Sentry goes through the `/monitoring` tunnel), Supabase (auth and
 * Realtime) and allons-api. An injected skimmer has nowhere to post to.
 *
 * `script-src` keeps 'unsafe-inline' because Next's App Router writes inline
 * bootstrap scripts, and a nonce would force every page to render per
 * request. Framing, plugins, <base> hijacking and foreign form targets are
 * all closed.
 */
function contentSecurityPolicy(): string {
  const supabase = originOf(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const api =
    originOf(process.env.NEXT_PUBLIC_ALLONS_API_URL) ??
    (isDev ? "http://127.0.0.1:3000" : "https://api.allonsapp.com");

  const connect = [
    "'self'",
    api,
    "https://api.allonsapp.com",
    "https://*.supabase.co",
    "wss://*.supabase.co",
  ];
  if (supabase) {
    connect.push(supabase, supabase.replace(/^http/, "ws"));
  }
  if (isDev) connect.push("ws:", "http://localhost:*", "http://127.0.0.1:*");

  const directives: Record<string, string[]> = {
    "default-src": ["'self'"],
    "script-src": ["'self'", "'unsafe-inline'", ...(isDev ? ["'unsafe-eval'"] : [])],
    "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
    "font-src": ["'self'", "data:", "https://fonts.gstatic.com"],
    // Event covers, avatars and comercio logos come from storage buckets and
    // Instagram CDNs the API decides, so images and video accept any HTTPS.
    "img-src": ["'self'", "data:", "blob:", "https:"],
    "media-src": ["'self'", "blob:", "https:"],
    "connect-src": Array.from(new Set(connect)),
    "worker-src": ["'self'", "blob:"],
    "frame-src": ["'none'"],
    "object-src": ["'none'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
    "frame-ancestors": ["'none'"],
    "manifest-src": ["'self'"],
  };

  const policy = Object.entries(directives)
    .map(([name, sources]) => `${name} ${sources.join(" ")}`)
    .join("; ");
  return isDev ? policy : `${policy}; upgrade-insecure-requests`;
}

const config: NextConfig = {
  reactStrictMode: true,
  // The Network URL Next prints (192.168.x.x) is not allowed for /_next/hmr.
  // Without it the client never hydrates and /eventos stays on the white splash.
  allowedDevOrigins: ["192.168.*.*", "10.*.*.*"],
  // `onDemandEntries` used to live here, to stop `next dev` dropping a route it
  // had not served for 60 s and rebuilding it on the next click — seconds per
  // tab change in the comercio panel. Only the webpack hot reloader reads that
  // option, and Next 16 serves dev with Turbopack, which does not dispose
  // routes that way. Leaving it would have promised a fix nothing applies.

  // No `X-Powered-By: Next.js`: it only tells a scanner which CVEs to try.
  poweredByHeader: false,

  // Baseline hardening for a site that now hosts a card form: no framing (a
  // clickjacked checkout is the classic attack on one), no MIME sniffing, no
  // order URLs leaking through Referer, no sensor APIs for any script, HTTPS
  // only, and a CSP that decides where the page may send data.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: contentSecurityPolicy() },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(), payment=(), usb=(), " +
              "serial=(), hid=(), magnetometer=(), gyroscope=(), " +
              "accelerometer=(), browsing-topics=()",
          },
        ],
      },
      {
        // Route handlers answer per request (waitlist, health). No shared
        // cache or browser cache should keep a copy.
        source: "/api/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store, max-age=0" },
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
    ];
  },
  async redirects() {
    return [{ source: "/", destination: "/events", permanent: true }];
  },
  async rewrites() {
    return [
      { source: "/eventos", destination: "/events" },
      { source: "/eventos/:path*", destination: "/events/:path*" },
    ];
  },
};

/**
 * Source maps go up only when SENTRY_AUTH_TOKEN is set, so a local build or a
 * preview without Sentry credentials behaves exactly as before.
 */
export default withSentryConfig(config, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !process.env.CI,
  widenClientFileUpload: true,
  // Routes Sentry's own requests through this site, so an ad blocker does not
  // silently drop every client-side error report.
  tunnelRoute: "/monitoring",
});
