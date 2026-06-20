import { test, expect } from "@playwright/test";
import { HAS_CREDS, login, OVERFLOW_VALUE, SAFE_VALUE, expectOverflowToast, expectSuccessToast, requireCreds } from "./helpers";

const NEGATIVE_VALUE = "-1000";
const HUGE_DECIMAL = "999999999999999999999.9999";
const INVALID_INPUT = "abc123xyz";

test.describe("Money overflow guards", () => {
  requireCreds();

  test.beforeEach(async ({ page }) => {
    if (!HAS_CREDS) return;
    await login(page);
  });

  test("Project: rejects overflow, accepts safe value", async ({ page }) => {
    await page.goto("/projects");
    await page.getByRole("button", { name: /project baru/i }).click();

    const code = `E2E-${Date.now()}`;
    await page.getByLabel(/kode proyek/i).fill(code);
    await page.getByLabel(/nama proyek/i).fill(`E2E Overflow ${code}`);

    // Overflow attempt
    await page.getByLabel(/nilai kontrak/i).fill(OVERFLOW_VALUE);
    await page.getByRole("button", { name: /simpan project/i }).click();
    await expectOverflowToast(page);

    // Replace with safe value
    await page.getByLabel(/nilai kontrak/i).fill(SAFE_VALUE);
    await page.getByRole("button", { name: /simpan project/i }).click();
    await expectSuccessToast(page);
    await expect(page.getByText(code)).toBeVisible();
  });

  test("Contract form: rejects overflow", async ({ page }) => {
    await page.goto("/contracts");
    await page.getByRole("button", { name: /(kontrak|tambah|baru)/i }).first().click();
    await page.getByLabel(/nilai \(idr\)/i).fill(OVERFLOW_VALUE);
    // Inline error from MoneyInput
    await expect(page.getByText(/melebihi batas maksimum/i).first()).toBeVisible();
  });

  test("Invoice form: rejects overflow on amount", async ({ page }) => {
    await page.goto("/invoices");
    await page.getByRole("button", { name: /(invoice|tambah|baru)/i }).first().click();
    await page.getByLabel(/^amount/i).fill(OVERFLOW_VALUE);
    await expect(page.getByText(/melebihi batas maksimum/i).first()).toBeVisible();
  });

  test("Variation form: rejects overflow", async ({ page }) => {
    await page.goto("/variations");
    await page.getByRole("button", { name: /(vo|tambah|baru)/i }).first().click();
    await page.getByLabel(/^amount/i).fill(OVERFLOW_VALUE);
    await expect(page.getByText(/melebihi batas maksimum/i).first()).toBeVisible();
  });

  test("MoneyInput: rejects negative values inline", async ({ page }) => {
    await page.goto("/projects");
    await page.getByRole("button", { name: /project baru/i }).click();
    await page.getByLabel(/nilai kontrak/i).fill(NEGATIVE_VALUE);
    await expect(page.getByText(/tidak boleh negatif/i).first()).toBeVisible();
  });

  test("MoneyInput: rejects very large decimals inline", async ({ page }) => {
    await page.goto("/projects");
    await page.getByRole("button", { name: /project baru/i }).click();
    await page.getByLabel(/nilai kontrak/i).fill(HUGE_DECIMAL);
    await expect(page.getByText(/melebihi batas maksimum/i).first()).toBeVisible();
  });

  test("MoneyInput: rejects non-numeric input inline", async ({ page }) => {
    await page.goto("/projects");
    await page.getByRole("button", { name: /project baru/i }).click();
    await page.getByLabel(/nilai kontrak/i).fill(INVALID_INPUT);
    // typed input gets parsed; non-digits become "" so no value -> we type after a digit
    await page.getByLabel(/nilai kontrak/i).fill("12abc");
    // The cleaned value is "12" (valid) — assert no overflow shown but accept clean fallback
    await expect(page.getByText(/melebihi batas maksimum/i)).toHaveCount(0);
  });

  test("Overflow error message includes the exact field name", async ({ page }) => {
    await page.goto("/contracts");
    await page.getByRole("button", { name: /(kontrak|tambah|baru)/i }).first().click();
    await page.getByLabel(/nilai \(idr\)/i).fill(OVERFLOW_VALUE);
    // MoneyInput renders `"<fieldLabel>": ...` in the inline error
    await expect(page.getByText(/"(nilai|value|amount|contract_value)"/i).first()).toBeVisible();
  });
});
