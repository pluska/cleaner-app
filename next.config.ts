
import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();

const nextConfig: NextConfig = {
  distDir: process.env.E2E === "1" ? ".next-e2e" : ".next",
  eslint: {
    // Enable ESLint during production builds
    ignoreDuringBuilds: false,
  },
  typescript: {
    // Enable TypeScript type checking during production builds
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
