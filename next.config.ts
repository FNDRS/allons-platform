import type { NextConfig } from "next";

const config: NextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      { source: "/eventos", destination: "/events" },
      { source: "/eventos/:path*", destination: "/events/:path*" },
    ];
  },
};

export default config;
