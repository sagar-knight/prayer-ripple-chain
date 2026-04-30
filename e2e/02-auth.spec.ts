import { test, expect } from "@playwright/test";

test("login page renders email + password fields", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByLabel(/email/i)).toBeVisible();
  await expect(page.getByLabel(/password/i).first()).toBeVisible();
});

test("signup link navigates to signup", async ({ page }) => {
  await page.goto("/login");
  const link = page.getByRole("link", { name: /sign up|create.*account/i }).first();
  if (await link.isVisible()) {
    await link.click();
    await expect(page).toHaveURL(/signup/);
  }
});
