import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable development indicators without using devIndicators
  experimental: {
    webVitalsAttribution: [],
  },
  // Disable React StrictMode for easier testing
  reactStrictMode: false,
};

export default nextConfig;
