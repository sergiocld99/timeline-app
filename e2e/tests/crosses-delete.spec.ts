import { test, expect, type APIRequestContext } from '@playwright/test';

const backendUrl = 'http://localhost:3000/api';
const fixturePrefix = 'E2E Cross Delete';

// September 2099 is reserved for this spec: cleanup wipes the whole month, so a run that
// fails between creating and deleting its travels leaves nothing behind to collide with the
// unique {userId, startTime, origin} index on the next run.
const cleanupFixtures = async (request: APIRequestContext) => {
  const travelsResponse = await request.get(`${backendUrl}/travels`, {
    params: { dateFrom: '2099-09-01T00:00', dateTo: '2099-09-30T23:59', userId: '1' },
  });
  const { travels } = await travelsResponse.json();

  for (const travel of travels) {
    await request.delete(`${backendUrl}/travels/${travel._id}`);
  }

  const crossesResponse = await request.get(`${backendUrl}/crosses`);
  const crosses = await crossesResponse.json();

  for (const cross of crosses.filter((cross: { name: string }) => cross.name.startsWith(fixturePrefix))) {
    await request.delete(`${backendUrl}/crosses/${cross._id}`);
  }
};

const createCross = async (request: APIRequestContext, name: string) => {
  const response = await request.post(`${backendUrl}/crosses`, {
    data: { name, latitude: -34.6, longitude: -58.4 },
  });

  return (await response.json())._id;
};

const createTravelWithCross = async (request: APIRequestContext, crossId: string, startTime: string) => {
  const locations = await (await request.get(`${backendUrl}/locations`)).json();
  const response = await request.post(`${backendUrl}/travels`, {
    data: {
      userId: 1,
      startTime,
      endTime: startTime.replace('T18:45', 'T19:45'),
      origin: locations[0]._id,
      destination: locations[1]._id,
      modeOfTransport: 'car',
      distance: 12.5,
      crosses: [crossId],
    },
  });

  return (await response.json())._id;
};

test.describe('Crosses Page Delete', () => {
  // Fixtures are wiped before/after each test, so they must not overlap: run this file serially.
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ request }) => cleanupFixtures(request));

  test.afterEach(async ({ request }) => cleanupFixtures(request));

  test('deletes a cross that has no travels', async ({ page, request }) => {
    const name = `${fixturePrefix} Unused`;
    await createCross(request, name);

    await page.goto('/crosses');
    page.on('dialog', (dialog) => dialog.accept());

    // Desktop and mobile tables render the same rows, so target the first match only.
    await page.locator('tr', { hasText: name }).first().locator('button[title="Delete"]').click();

    await expect(page.getByText('Cross deleted successfully')).toBeVisible();
    await expect(page.locator('tr', { hasText: name })).toHaveCount(0);
  });

  test('reports the date of the travel blocking the deletion', async ({ page, request }) => {
    const name = `${fixturePrefix} Single Travel`;
    const crossId = await createCross(request, name);
    await createTravelWithCross(request, crossId, '2099-09-15T18:45:00.000Z');

    await page.goto('/crosses');
    page.on('dialog', (dialog) => dialog.accept());

    await page.locator('tr', { hasText: name }).first().locator('button[title="Delete"]').click();

    await expect(
      page.getByText(`Cannot delete "${name}": its only associated travel is dated 2099-09-15`)
    ).toBeVisible();
    await expect(page.locator('tr', { hasText: name })).toHaveCount(2);
  });

  test('reports how many travels block the deletion', async ({ page, request }) => {
    const name = `${fixturePrefix} Many Travels`;
    const crossId = await createCross(request, name);
    await createTravelWithCross(request, crossId, '2099-09-16T18:45:00.000Z');
    await createTravelWithCross(request, crossId, '2099-09-17T18:45:00.000Z');

    await page.goto('/crosses');
    page.on('dialog', (dialog) => dialog.accept());

    await page.locator('tr', { hasText: name }).first().locator('button[title="Delete"]').click();

    await expect(
      page.getByText(`Cannot delete "${name}": it has 2 associated travels`)
    ).toBeVisible();
    await expect(page.locator('tr', { hasText: name })).toHaveCount(2);
  });
});
