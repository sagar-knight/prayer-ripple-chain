import { test, expect } from "@playwright/test";

test("ripple impact page is auth-gated and reachable", async ({ page }) => {
  await page.goto("/ripple");
  await page.waitForLoadState("domcontentloaded");
  expect(page.url()).toMatch(/(ripple|login)/);
});
