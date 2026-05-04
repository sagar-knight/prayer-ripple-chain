import { test, expect } from "@playwright/test";

/**
 * Short prayer share link coverage.
 *
 * The /p/:slug route is fully public (no login required) and is served by
 * the get_prayer_by_slug RPC, which only returns prayers that are currently
 * open + public. Restricted/closed requests should not be reachable by
 * guessing a slug.
 */

test("invalid slug shows a friendly Not Found page", async ({ page }) => {
  await page.goto("/p/this-slug-does-not-exist-zzzz");
  await expect(page.getByText(/Prayer Request Not Found/i)).toBeVisible();
  // CTA back into the app
  await expect(page.getByRole("link", { name: /Pray for Someone/i })).toBeVisible();
});

test("missing slug also shows the Not Found state", async ({ page }) => {
  // An obviously bad slug pattern
  await page.goto("/p/-");
  await expect(page.getByText(/Prayer Request Not Found/i)).toBeVisible();
});

test("legacy /invite/:code links still render the invite landing", async ({ page }) => {
  await page.goto("/invite/legacy-code-test");
  // Either the invite renders, or it shows the Invitation Not Found page.
  // Both are acceptable; the route must not 404 at the router level.
  await expect(
    page.getByText(/Invitation Not Found|You were invited to pray/i)
  ).toBeVisible();
});

test("share dialog (when reachable) exposes the short prayerforward.com link", async ({ page }) => {
  // The Share button lives on PrayerCard which requires data on /pray.
  // We only assert the dialog contract when a card is actually present, so
  // this test is non-flaky in empty environments.
  await page.goto("/pray");
  const shareBtn = page.getByRole("button", { name: /^Share$/ }).first();
  if (!(await shareBtn.isVisible().catch(() => false))) {
    test.skip(true, "No prayer card available in this environment");
  }
  await shareBtn.click();
  await expect(page.getByText(/Share this prayer request/i)).toBeVisible();

  // The readonly input in the dialog must contain a prayerforward.com/p/ link
  const input = page.locator('input[readonly]').first();
  await expect(input).toBeVisible();
  const value = await input.inputValue();
  expect(value).toMatch(/^https:\/\/prayerforward\.com\/p\/[a-z0-9-]+$/);

  // Channel buttons exist
  await expect(page.getByRole("link", { name: /WhatsApp/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /SMS/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /Email/i })).toBeVisible();
});