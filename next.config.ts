import type { NextConfig } from "next";

const config: NextConfig = {
  reactStrictMode: true,
  // Dev only. By default `next dev` drops a route it has not served for 60 s
  // and rebuilds it on the next click, which costs seconds per tab change in
  // the comercio panel. Keep compiled routes around for the whole session.
  onDemandEntries: {
    maxInactiveAge: 60 * 60 * 1000,
    pagesBufferLength: 20,
  },
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

export default config;
