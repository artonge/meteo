import { test, expect } from '@playwright/test';

test.describe('Home page', () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
    await context.addInitScript(() => localStorage.clear());
  });

  test('shows header with logo and city search input', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('header a[href="/about"] img')).toBeVisible();
    await expect(page.locator('.vs__search')).toBeVisible();
    await expect(page.locator('.vs__search')).toHaveAttribute('placeholder', 'Enter a city name. Ex: Paris');
    await expect(page.locator('button[aria-label="Use device location"]')).toBeVisible();
  });

  test('matches screenshot', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveScreenshot('home.png');
  });
});

test.describe('About page', () => {
  test('shows settings and info sections', async ({ page }) => {
    await page.goto('/about');

    await expect(page.locator('header a[href="/"]')).toBeVisible();
    await expect(page.locator('h3').filter({ hasText: 'Models' })).toBeVisible();
    await expect(page.locator('h3').filter({ hasText: 'Forecast length' })).toBeVisible();
    await expect(page.locator('h3').filter({ hasText: 'Build date' })).toBeVisible();
    await expect(page.locator('h3').filter({ hasText: 'Source code' })).toBeVisible();
    await expect(page.locator('a[href="https://github.com/artonge/meteo"]')).toBeVisible();
  });

  test('matches screenshot', async ({ page }) => {
    await page.goto('/about');
    await expect(page).toHaveScreenshot('about.png');
  });
});
