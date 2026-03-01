import { test, expect } from '@playwright/test';

test('can create and delete travel', async ({ page }) => {
  await page.goto('/creator');

  // Select origin
  await page.locator('button[role="combobox"]').filter({ hasText: 'Select Origin' }).click();
  await page.getByPlaceholder('Search locations...').fill('1425');
  // Dropdown auto-selects and closes when 1 match is found
  await expect(page.locator('button[role="combobox"]').filter({ hasText: 'C1425 - Palermo' })).toBeVisible();

  // Select destination
  await page.locator('button[role="combobox"]').filter({ hasText: 'Select Destination' }).click();
  await page.getByPlaceholder('Search locations...').fill('Varela Centro');
  // Dropdown auto-selects and closes
  await expect(page.locator('button[role="combobox"]').filter({ hasText: 'B1888 - Varela Centro' })).toBeVisible();

  // Set time and distance with explicit value checking to handle React state sync
  const startTime = page.locator('#startTime');
  await startTime.fill('2099-08-18T16:20');
  await startTime.blur();

  const endTime = page.locator('#endTime');
  await endTime.fill('18:00');
  await endTime.blur();

  const distance = page.locator('#distance');
  await distance.fill('30');
  await distance.blur();

  // Verify inputs before submitting to avoid issues with Playwright speed
  await expect(page.locator('#startTime')).toHaveValue('2099-08-18T16:20');
  await expect(page.locator('#endTime')).toHaveValue('18:00');
  await expect(page.locator('#distance')).toHaveValue('30');

  // Save travel - Wait for the POST request to complete
  const createPromise = page.waitForResponse(response =>
    response.url().includes('/travels') && response.request().method() === 'POST' && response.status() === 201
  );
  await page.getByRole('button', { name: 'Create Travel' }).click()
  await createPromise;

  await expect(page.getByText('Travel added successfully')).toBeVisible()

  // Wait for initial load of travels BEFORE navigating
  const initialLoadPromise = page.waitForResponse(response =>
    response.url().includes('/travels') && response.request().method() === 'GET'
  );
  await page.goto('/travels');
  await initialLoadPromise;

  // Filter by date range
  await page.locator('#date_from').fill('2099-08-01T00:00')
  await page.locator('#date_to').fill('2099-08-31T23:59')

  // Wait for the filtered travels list to load
  const filterPromise = page.waitForResponse(response =>
    response.url().includes('/travels') && response.request().method() === 'GET'
  );
  await page.locator('button').filter({ hasText: 'Apply' }).click()
  await filterPromise;

  await expect(page.locator('td').filter({ hasText: '1 travel' })).toBeVisible()

  // Delete travel - Wait for the DELETE request to complete
  const deletePromise = page.waitForResponse(response =>
    response.url().includes('/travels') && response.request().method() === 'DELETE' && response.status() === 204
  );
  await page.getByRole('button', { name: 'Delete' }).click()
  await deletePromise;

  await expect(page.locator('td').filter({ hasText: '0 travels' })).toBeVisible()
  await expect(page.locator('td').filter({ hasText: 'NaN' })).not.toBeVisible()
  await expect(page.getByText('Travel deleted successfully!')).toBeVisible()
})