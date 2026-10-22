
import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();

const nextConfig: NextConfig = {
  distDir: process.env.E2E === "1" ? ".next-e2e" : ".next",
  typescript: {
    // Enable TypeScript type checking during production builds
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
