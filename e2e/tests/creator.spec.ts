import { test, expect } from '@playwright/test';

test('can fill travel form', async ({ page }) => {
  await page.goto('/creator');

  await page.locator('button[role="combobox"]').filter({ hasText: 'Select Origin' }).click();
  await page.getByPlaceholder('Search locations...').fill('1425');

  await page.locator('button[role="combobox"]').filter({ hasText: 'Select Destination' }).click();
  await page.getByPlaceholder('Search locations...').fill('Varela Centro');

  await page.locator('#startTime').fill('2099-08-18T16:20');
  await page.locator('#endTime').fill('18:00')
  await page.locator('#distance').fill('30')

  await page.getByRole('button', { name: 'Create Travel' }).click()
  await expect(page.getByText('Travel added successfully')).toBeVisible()

  await page.screenshot({ path: 'test-results/creator.png' });
})

test('can delete travel just created', async ({ page }) => {
  await page.goto('/travels');

  await page.locator('#date_from').fill('2099-08-01T00:00')
  await page.locator('#date_to').fill('2099-08-31T23:59')
  await page.locator('button').filter({ hasText: 'Apply' }).click()
  await expect(page.locator('td').filter({ hasText: '1 travels' })).toBeVisible()

  await page.screenshot({ path: 'test-results/travels.png', fullPage: true });
  await page.getByRole('button', { name: 'Delete travel' }).click()

  await expect(page.getByText('Travel deleted successfully!')).toBeVisible()
  await page.screenshot({ path: 'test-results/travels_after_delete.png', fullPage: true });
})