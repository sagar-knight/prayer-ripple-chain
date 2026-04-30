import { test, expect } from "@playwright/test";

test("submit prayer page redirects unauthenticated user to login", async ({ page }) => {
  await page.goto("/submit");
  await expect(page).toHaveURL(/login/);
});
