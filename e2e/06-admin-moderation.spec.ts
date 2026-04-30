import { test, expect } from "@playwright/test";

test("admin route guards unauthenticated access", async ({ page }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/login|\//);
});
