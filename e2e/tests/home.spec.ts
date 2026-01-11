import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');

  // Expect a title "to contain" a substring.
  // Note: Adjust this expected title to match your actual app title if known, 
  // or use a more generic check like checking for a main element.
  await expect(page).toHaveTitle(/Timeline App/);
});

test('get started link', async ({ page }) => {
  await page.goto('/');

  // Check if main content is visible
  await expect(page.locator('main')).toBeVisible();

  // Take a screenshot for visual verification
  await page.screenshot({ path: 'test-results/homepage.png' });
});

test('can switch to dark mode', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('button', { name: 'Toggle theme' }).click();
  await page.getByRole('menuitem', { name: 'Dark' }).click();
  await expect(page.locator('html')).toHaveClass(/dark/);

  await page.screenshot({ path: 'test-results/darkmode.png' });
})