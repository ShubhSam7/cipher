import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL(".", import.meta.url)) } },
  test: {
    environment: "node",
    include: ["tests/**/*.test.{js,ts}"],
    restoreMocks: true,
    env: {
      ADMIN_EMAILS: "bt23csa041@iiitn.ac.in",
      JWT_SECRET: "test-only-secret-never-use-in-production",
      DATABASE_URL: "postgresql://test:test@localhost:5432/cipher_test",
      DIRECT_URL: "postgresql://test:test@localhost:5432/cipher_test",
      EMAIL_USER: "test@example.com",
      EMAIL_PASS: "test-only-mail-password",
    },
  },
});
