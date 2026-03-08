import { test, expect } from '@playwright/test';

test.describe('Locations Page Header Bug', () => {
  test('does not show table headers when no locations match the search', async ({ page }) => {
    await page.goto('/locations');

    // Type something that won't match anything
    const searchInput = page.getByPlaceholder('Search locations...');
    await searchInput.fill('non-existent-location-abcd-1234');

    // Wait for the "No locations found" message
    await expect(page.getByText(/No locations found matching/i)).toBeVisible();

    // BUG REPRODUCTION: The "Name" header should NOT be visible
    // In the current bug state, it is visible at the bottom.
    const nameHeader = page.getByRole('columnheader', { name: 'Name' });

    // We expect it NOT to be visible.
    await expect(nameHeader).not.toBeVisible();
  });
});
