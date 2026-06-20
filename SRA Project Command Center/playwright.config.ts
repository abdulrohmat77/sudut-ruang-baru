import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright E2E config for Sudut Ruang PMIS.
 *
 * Run locally:
 *   E2E_BASE_URL=http://localhost:8080 \
 *   E2E_EMAIL=test@example.com \
 *   E2E_PASSWORD=yourpw \
 *   bunx playwright test
 *
 * The test user must already exist in Lovable Cloud auth and have at least
 * one project (or permission to create one). Tests skip themselves when
 * credentials are not provided so CI does not break.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:8080",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});