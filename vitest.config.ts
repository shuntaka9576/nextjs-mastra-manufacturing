import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    testTimeout: 100_000_000,
    // coverage: {
    //   include: ["src/**/*.ts"],
    //   reporter: ["json"],
    // },
    // reporters: "verbose",
    globalSetup: "./test/globalSetup.ts",
    setupFiles: ["./test/testSetup.ts"],
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./"),
    },
  },
});
