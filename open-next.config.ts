import { defineCloudflareConfig } from "@opennextjs/cloudflare";
export default {
  ...defineCloudflareConfig(),
  // Keep the Next.js step separate so the Cloudflare build never calls itself.
  buildCommand: "npm run build:next",
};
