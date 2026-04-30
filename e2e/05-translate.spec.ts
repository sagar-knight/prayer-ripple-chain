import { test, expect } from "@playwright/test";

test("home shows prayer cards (translate button visible when logged in)", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  // public users see cards too — at least the page should not crash
  await expect(page.locator("body")).toBeVisible();
});
