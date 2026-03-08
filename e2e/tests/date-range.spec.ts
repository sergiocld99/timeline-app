import { test, expect } from '@playwright/test';

test.describe('Date Range Selector Validation', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to a page that contains the DateRangeSelector
    await page.goto('/crosses');
  });

  test('Apply button is enabled for valid date range', async ({ page }) => {
    const fromInput = page.locator('#date_from');
    const toInput = page.locator('#date_to');
    const applyButton = page.getByRole('button', { name: 'Apply', exact: true });

    // Set a valid range: From 2026-03-01 < To 2026-03-07
    await fromInput.fill('2026-03-01T00:00');
    await toInput.fill('2026-03-07T23:59');

    // Check that the Apply button is NOT disabled
    await expect(applyButton).toBeEnabled();

    // Check that inputs don't have the error border (red)
    await expect(fromInput).not.toHaveClass(/border-red-500/);
    await expect(toInput).not.toHaveClass(/border-red-500/);
  });

  test('Apply button is disabled for invalid date range', async ({ page }) => {
    const fromInput = page.locator('#date_from');
    const toInput = page.locator('#date_to');
    const applyButton = page.getByRole('button', { name: 'Apply', exact: true });

    // Set an invalid range: From 2026-03-10 > To 2026-03-07
    await fromInput.fill('2026-03-10T00:00');
    await toInput.fill('2026-03-07T23:59');

    // Check that the Apply button IS disabled
    await expect(applyButton).toBeDisabled();

    // Check that inputs have the error border (red)
    await expect(fromInput).toHaveClass(/border-red-500/);
    await expect(toInput).toHaveClass(/border-red-500/);
  });
});
