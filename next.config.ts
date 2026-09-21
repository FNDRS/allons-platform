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
  async rewrites() {
    return [
      { source: "/eventos", destination: "/events" },
      { source: "/eventos/:path*", destination: "/events/:path*" },
    ];
  },
};

export default config;
