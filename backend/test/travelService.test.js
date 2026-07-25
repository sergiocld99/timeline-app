import test from 'node:test';
import assert from 'node:assert';
import { computeDestinationSuggestion } from '../services/travelService.js';

const travel = (isoTime, destination, durationMinutes = 30) => ({
  startTime: new Date(isoTime),
  endTime: new Date(new Date(isoTime).getTime() + durationMinutes * 60 * 1000),
  destination,
});

test('travelService.computeDestinationSuggestion', async (t) => {
  await t.test('returns null when there are no travels', () => {
    assert.strictEqual(computeDestinationSuggestion([], 60), null);
  });

  await t.test('returns null when the only match is a single one-off trip', () => {
    const travels = [travel('2026-06-01T09:00:00.000Z', 'destA')];

    assert.strictEqual(computeDestinationSuggestion(travels, 9 * 60), null);
  });

  await t.test('returns the destination once it has at least two matches within tolerance', () => {
    const travels = [
      travel('2026-06-01T09:00:00.000Z', 'destA'),
      travel('2026-06-08T09:05:00.000Z', 'destA'),
    ];

    assert.deepStrictEqual(
      computeDestinationSuggestion(travels, 9 * 60),
      { destination: 'destA', count: 2, durationMinutes: 30 }
    );
  });

  await t.test('ignores travels outside the tolerance window', () => {
    const travels = [
      travel('2026-06-01T09:00:00.000Z', 'destA'),
      travel('2026-06-08T09:20:00.000Z', 'destA'), // 20 min away, outside default 15 min tolerance
    ];

    assert.strictEqual(computeDestinationSuggestion(travels, 9 * 60), null);
  });

  await t.test('picks the destination with more matches when several qualify', () => {
    const travels = [
      travel('2026-05-01T09:00:00.000Z', 'destA'),
      travel('2026-05-08T09:00:00.000Z', 'destA'),
      travel('2026-05-15T09:00:00.000Z', 'destA'),
      travel('2026-06-01T09:05:00.000Z', 'destB'),
      travel('2026-06-08T09:05:00.000Z', 'destB'),
    ];

    assert.deepStrictEqual(
      computeDestinationSuggestion(travels, 9 * 60),
      { destination: 'destA', count: 3, durationMinutes: 30 }
    );
  });

  await t.test('breaks ties between equally-frequent destinations by most recent travel', () => {
    const travels = [
      travel('2026-05-01T09:00:00.000Z', 'destA'),
      travel('2026-05-08T09:00:00.000Z', 'destA'),
      travel('2026-06-01T09:00:00.000Z', 'destB'),
      travel('2026-06-15T09:00:00.000Z', 'destB'),
    ];

    assert.deepStrictEqual(
      computeDestinationSuggestion(travels, 9 * 60),
      { destination: 'destB', count: 2, durationMinutes: 30 }
    );
  });

  await t.test('wraps the tolerance window across the midnight boundary', () => {
    const travels = [
      travel('2026-06-01T23:55:00.000Z', 'destA'),
      travel('2026-06-08T00:05:00.000Z', 'destA'),
    ];

    // target is 00:00, both travels are within 5 minutes across midnight
    assert.deepStrictEqual(
      computeDestinationSuggestion(travels, 0),
      { destination: 'destA', count: 2, durationMinutes: 30 }
    );
  });

  await t.test('reports the median duration of the matched travels', () => {
    const travels = [
      travel('2026-06-01T09:00:00.000Z', 'destA', 20),
      travel('2026-06-08T09:00:00.000Z', 'destA', 30),
      travel('2026-06-15T09:00:00.000Z', 'destA', 120), // outlier, ignored by the median
    ];

    assert.deepStrictEqual(
      computeDestinationSuggestion(travels, 9 * 60),
      { destination: 'destA', count: 3, durationMinutes: 30 }
    );
  });

  await t.test('returns a null duration when the matched travels have no endTime', () => {
    const travels = [
      { startTime: new Date('2026-06-01T09:00:00.000Z'), destination: 'destA' },
      { startTime: new Date('2026-06-08T09:00:00.000Z'), destination: 'destA' },
    ];

    assert.deepStrictEqual(
      computeDestinationSuggestion(travels, 9 * 60),
      { destination: 'destA', count: 2, durationMinutes: null }
    );
  });

  await t.test('respects custom toleranceMinutes and minOccurrences options', () => {
    const travels = [
      travel('2026-06-01T09:00:00.000Z', 'destA'),
      travel('2026-06-08T09:25:00.000Z', 'destA'),
    ];

    assert.deepStrictEqual(
      computeDestinationSuggestion(travels, 9 * 60, { toleranceMinutes: 30, minOccurrences: 1 }),
      { destination: 'destA', count: 2, durationMinutes: 30 }
    );
  });
});
