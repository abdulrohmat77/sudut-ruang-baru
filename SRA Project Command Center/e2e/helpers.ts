import { Page, expect, test } from "@playwright/test";

export const HAS_CREDS = Boolean(process.env.E2E_EMAIL && process.env.E2E_PASSWORD);

/** Skip a suite cleanly when credentials are missing. */
export function requireCreds() {
  test.skip(!HAS_CREDS, "E2E_EMAIL / E2E_PASSWORD not set");
}

export async function login(page: Page) {
  await page.goto("/auth");
  await page.getByLabel(/email/i).fill(process.env.E2E_EMAIL!);
  await page.getByLabel(/password/i).fill(process.env.E2E_PASSWORD!);
  await page.getByRole("button", { name: /sign in|masuk|login/i }).click();
  await page.waitForURL((url) => !url.pathname.startsWith("/auth"), { timeout: 15_000 });
}

/** A value that exceeds MAX_MONETARY (1e19). */
export const OVERFLOW_VALUE = "100000000000000000000"; // 1e20
/** A safe in-range value (Rp 1 billion). */
export const SAFE_VALUE = "1000000000";

export async function expectOverflowToast(page: Page) {
  // Sonner renders aria role=status; toast text contains the cap message.
  await expect(page.getByText(/melebihi batas maksimum/i).first()).toBeVisible({ timeout: 5_000 });
}

export async function expectSuccessToast(page: Page) {
  await expect(page.getByText(/tersimpan|dibuat/i).first()).toBeVisible({ timeout: 8_000 });
}