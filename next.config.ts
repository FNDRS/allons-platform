import { withSentryConfig } from "@sentry/nextjs/config";
import type { NextConfig } from "next";

const config: NextConfig = {
  reactStrictMode: true,
  // `onDemandEntries` used to live here, to stop `next dev` dropping a route it
  // had not served for 60 s and rebuilding it on the next click — seconds per
  // tab change in the comercio panel. Only the webpack hot reloader reads that
  // option, and Next 16 serves dev with Turbopack, which does not dispose
  // routes that way. Leaving it would have promised a fix nothing applies.

  // Baseline hardening for a site that now hosts a card form: no framing (a
  // clickjacked checkout is the classic attack on one), no MIME sniffing, no
  // order URLs leaking through Referer, and no sensor APIs for any script.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
          },
        ],
      },
    ];
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
