import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

/**
 * Deliberately standalone.
 *
 * The app's vite.config.ts delegates to @lovable.dev/vite-tanstack-config,
 * which warns that adding plugins to it breaks the app. These are plain Node
 * unit tests over pure functions — no JSX, no router, no browser — so they
 * need none of that. Component tests, when they arrive, should use Vitest's
 * browser mode rather than being bolted onto the app's build config.
 */
export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
