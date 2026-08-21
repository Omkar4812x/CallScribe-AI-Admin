import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Suppress the "Server Actions" size warning for dev
  experimental: {},
  // Allow images from any HTTPS source (update to specific domains in prod)
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default nextConfig;
