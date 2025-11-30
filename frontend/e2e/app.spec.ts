import { test, expect } from "@playwright/test";

test("has title", async ({ page }) => {
  await page.goto("/");

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/DreamJar/);
});

test("home page loads", async ({ page }) => {
  await page.goto("/");

  // Check if the hero section is visible
  await expect(page.locator("text=Turn Dreams into Reality")).toBeVisible();
});

test("navigation works", async ({ page }) => {
  await page.goto("/");

  // Click on Leaderboard link
  await page.click("text=Leaderboard");

  // Check if we're on the leaderboard page
  await expect(page).toHaveURL(/.*leaderboard/);
});

test("create wish modal opens", async ({ page }) => {
  await page.goto("/");

  // Click on Create Wish button
  await page.click("text=Create Wish");

  // Check if modal is open
  await expect(page.locator("text=Create Your Wish")).toBeVisible();
});
