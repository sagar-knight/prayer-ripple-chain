import { test, expect } from "@playwright/test";

test("home renders with no console errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (msg) => { if (msg.type() === "error") errors.push(msg.text()); });

  await page.goto("/");
  await expect(page).toHaveTitle(/Prayer/i);
  await page.waitForLoadState("networkidle");
  expect(errors.filter(e => !/favicon|net::ERR_/.test(e))).toEqual([]);
});
