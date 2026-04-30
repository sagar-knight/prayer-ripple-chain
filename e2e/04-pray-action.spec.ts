import { test, expect } from "@playwright/test";

test("pray for others page is reachable", async ({ page }) => {
  await page.goto("/pray");
  // either auth-gated or shows prayer cards
  await page.waitForLoadState("domcontentloaded");
  expect(page.url()).toMatch(/(pray|login)/);
});
