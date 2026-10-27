import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.spec.ts"],
    env: { EXPO_PUBLIC_API_URL: "https://api.example.test" },
    restoreMocks: true,
  },
});
