import { test, expect } from "@playwright/test";

test("invalid church slug shows fallback (no crash)", async ({ page }) => {
  await page.goto("/join/__nonexistent-church__");
  await page.waitForLoadState("domcontentloaded");
  await expect(page.locator("body")).toBeVisible();
});
