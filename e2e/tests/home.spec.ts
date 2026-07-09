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

  // Check dashboard title
  await expect(page.locator('h1', { hasText: 'DASHBOARD' })).toBeVisible();

  // Take a screenshot for visual verification
  await page.screenshot({ path: 'test-results/homepage.png' });
});

test('can switch to dark mode', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('button', { name: 'Toggle theme' }).click();
  await page.getByRole('menuitem', { name: 'Dark' }).click();
  await expect(page.locator('html')).toHaveClass(/dark/);

  await page.screenshot({ path: 'test-results/darkmode.png' });
});

test('can switch language', async ({ page }) => {
  await page.goto('/');

  // Default is English, showing "DASHBOARD"
  await expect(page.locator('h1', { hasText: 'DASHBOARD' })).toBeVisible();

  // Open language dropdown (using aria-label/text from en.json)
  await page.getByRole('button', { name: 'Toggle language' }).click();
  // Click Spanish option
  await page.getByRole('menuitem', { name: 'Spanish' }).click();

  // Should navigate to /es and display Spanish translations (e.g. "PANEL")
  await expect(page.locator('h1', { hasText: 'PANEL' })).toBeVisible();

  // Open language dropdown (using translated aria-label from es.json)
  await page.getByRole('button', { name: 'Cambiar idioma' }).click();
  // Click English option ("Inglés")
  await page.getByRole('menuitem', { name: 'Inglés' }).click();

  // Should navigate back to /en and display English translation ("DASHBOARD")
  await expect(page.locator('h1', { hasText: 'DASHBOARD' })).toBeVisible();

  await page.screenshot({ path: 'test-results/language-switch.png' });
});