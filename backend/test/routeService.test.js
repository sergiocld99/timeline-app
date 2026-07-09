import test from 'node:test';
import assert from 'node:assert';
import { calculateHome } from '../services/routeService.js';

test('routeService.calculateHome', async (t) => {
  await t.test('should return null if topRoutes is empty', () => {
    assert.strictEqual(calculateHome([]), null);
  });

  await t.test('should return competitor1 if it appears in more routes', () => {
    const topRoutes = [
      { route: 'Gobernador Costa ↔ Florencio Varela Este', count: 39 },
      { route: 'Gobernador Costa ↔ Quilmes', count: 16 },
      { route: 'Gobernador Costa ↔ Varela Centro', count: 15 },
      { route: 'Gobernador Costa ↔ Florencio Varela Oeste', count: 10 },
      { route: 'Palermo ↔ Gobernador Costa', count: 8 }
    ];

    assert.strictEqual(calculateHome(topRoutes), 'Gobernador Costa');
  });

  await t.test('should return competitor2 if it appears in more routes', () => {
    const topRoutes = [
      { route: 'Palermo ↔ Gobernador Costa', count: 39 },
      { route: 'Gobernador Costa ↔ Quilmes', count: 16 },
      { route: 'Gobernador Costa ↔ Varela Centro', count: 15 },
    ];

    // In this case:
    // competitor1 is "Palermo"
    // competitor2 is "Gobernador Costa"
    // "Palermo" appears in 1 route.
    // "Gobernador Costa" appears in 3 routes.
    // It should return "Gobernador Costa".
    assert.strictEqual(calculateHome(topRoutes), 'Gobernador Costa');
  });

  await t.test('should return competitor1 if both competitors appear equally', () => {
    const topRoutes = [
      { route: 'A ↔ B', count: 10 },
      { route: 'C ↔ D', count: 5 }
    ];

    // competitor1 is "A" (appears in 1 route)
    // competitor2 is "B" (appears in 1 route)
    // appearances1.length >= appearances2.length is true (1 >= 1 is true)
    // returns competitor1 ("A")
    assert.strictEqual(calculateHome(topRoutes), 'A');
  });

  await t.test('should return competitor from topRoutes[1] if it appears in more routes overall', () => {
    const topRoutes = [
      { route: 'A ↔ B', count: 10 },
      { route: 'C ↔ D', count: 5 },
      { route: 'D ↔ E', count: 3 }
    ];

    // Candidates from topRoutes[0] & topRoutes[1]: A, B, C, D
    // D appears 2 times, others appear 1 time
    assert.strictEqual(calculateHome(topRoutes), 'D');
  });
});
