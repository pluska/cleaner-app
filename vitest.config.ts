import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    environment: "happy-dom",
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: [
        "src/libs/**/*.ts",
        "src/services/**/*.ts",
        "src/hooks/**/*.ts",
        "src/app/actions/**/*.ts",
        "src/app/api/auth/check-email/**/*.ts",
        "src/app/api/auth/signup/**/*.ts",
        "src/app/api/kingdom/**/*.ts",
        "src/app/api/cron/daily/**/*.ts",
        "src/app/api/tasks/route.ts",
        "src/app/api/tasks/[id]/toggle/**/*.ts",
        "src/app/api/store/purchase/**/*.ts",
        "src/app/api/user/profile/**/*.ts",
      ],
      exclude: [
        "**/*.d.ts",
        "**/*.test.ts",
        "**/types/**",
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "server-only": path.resolve(__dirname, "./src/test/server-only.ts"),
    },
  },
});
