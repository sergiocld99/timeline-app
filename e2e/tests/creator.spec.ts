import { test, expect } from '@playwright/test';

test('can create and delete travel', async ({ page }) => {
  await page.goto('/creator');

  // Select origin
  await page.locator('button[role="combobox"]').filter({ hasText: 'Select Origin' }).click();
  await page.getByPlaceholder('Search locations...').fill('1425');

  // Select destination
  await page.locator('button[role="combobox"]').filter({ hasText: 'Select Destination' }).click();
  await page.getByPlaceholder('Search locations...').fill('Varela Centro');

  // Set time and distance
  await page.locator('#startTime').fill('2099-08-18T16:20');
  await page.locator('#endTime').fill('18:00')
  await page.locator('#distance').fill('30')

  // Save travel
  await page.screenshot({ path: 'test-results/creator_filled.png' });
  await page.getByRole('button', { name: 'Create Travel' }).click()

  await expect(page.getByText('Travel added successfully')).toBeVisible()

  await page.screenshot({ path: 'test-results/creator_saved.png' });

  await page.goto('/travels');

  // Filter by date range
  await page.locator('#date_from').fill('2099-08-01T00:00')
  await page.locator('#date_to').fill('2099-08-31T23:59')
  await page.locator('button').filter({ hasText: 'Apply' }).click()
  await page.screenshot({ path: 'test-results/travels_loaded.png', fullPage: true });

  await expect(page.locator('td').filter({ hasText: '1 travels' })).toBeVisible()

  // Delete travel
  await page.getByRole('button', { name: 'Delete travel' }).click()

  await expect(page.locator('td').filter({ hasText: '0 travels' })).toBeVisible()
  await expect(page.locator('td').filter({ hasText: 'NaN' })).not.toBeVisible()
  await expect(page.getByText('Travel deleted successfully!')).toBeVisible()

  await page.screenshot({ path: 'test-results/travels_removed.png', fullPage: true });
})