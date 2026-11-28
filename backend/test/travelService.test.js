import test from 'node:test';
import assert from 'node:assert';
import { calculateByLineStats, calculateTravelStats, computeDestinationSuggestion } from '../services/travelService.js';

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

const place = (zipcode, name) => ({ zipcode, name, id: zipcode, latitude: 0, longitude: 0 });

const statsTravel = (isoTime, distance, originZip, destinationZip) => ({
  startTime: new Date(isoTime),
  endTime: new Date(isoTime),
  distance,
  duration: 30,
  speed: 10,
  weight: { percentage: 1 },
  origin: place(originZip, `name-${originZip}`),
  destination: place(destinationZip, `name-${destinationZip}`),
});

test('travelService.calculateTravelStats home', async (t) => {
  await t.test('picks the most frequent endpoint across the top routes', () => {
    const { home } = calculateTravelStats([
      statsTravel('2026-03-10T12:00:00.000Z', 10, 'B1000', 'C1400'),
      statsTravel('2026-03-11T12:00:00.000Z', 7, 'B1000', 'C1400'),
      statsTravel('2026-03-12T12:00:00.000Z', 3, 'B1000', 'B2000'),
    ]);

    assert.strictEqual(home, 'name-B1000');
  });
});

const lineTravel = (line, modeOfTransport = 'bus', distance = 10, duration = 20) => ({
  startTime: new Date('2026-04-01T12:00:00.000Z'),
  endTime: new Date('2026-04-01T12:20:00.000Z'),
  distance,
  duration,
  speed: 30,
  weight: { percentage: 1 },
  origin: place('B1000', 'name-B1000'),
  destination: place('C1400', 'name-C1400'),
  modeOfTransport,
  line,
});

test('travelService.calculateByLineStats', async (t) => {
  await t.test('groups bus rides by line, totals distance and duration, and sorts by rides', () => {
    const byLine = calculateByLineStats([
      lineTravel('152', 'bus', 10, 20),
      lineTravel('152', 'bus', 12.5, 25),
      lineTravel('60', 'bus', 5, 10),
      lineTravel('60', 'bus', 5, 10),
      lineTravel('99', 'car', 100, 60), // line on a non-bus travel is ignored
      lineTravel('', 'bus'), // blank lines are ignored
      lineTravel('   ', 'bus'),
    ]);

    assert.deepStrictEqual(byLine, [
      { line: '152', count: 2, totalKm: 22.5, totalMinutes: 45, averageSpeed: 30 },
      { line: '60', count: 2, totalKm: 10, totalMinutes: 20, averageSpeed: 30 },
    ]);
  });

  await t.test('computes a rounded aggregate speed and guards zero duration', () => {
    const byLine = calculateByLineStats([
      lineTravel('10', 'bus', 10, 7),
      lineTravel('11', 'bus', 10, 0),
    ]);

    assert.deepStrictEqual(byLine.map(({ line, averageSpeed }) => ({ line, averageSpeed })), [
      { line: '10', averageSpeed: 85.71 },
      { line: '11', averageSpeed: 0 },
    ]);
  });

  await t.test('falls back to the numeric line order when rides and minutes tie', () => {
    const byLine = calculateByLineStats([
      lineTravel('152', 'bus', 10, 20),
      lineTravel('60', 'bus', 5, 20),
    ]);

    assert.deepStrictEqual(byLine.map(stat => stat.line), ['60', '152']);
  });

  await t.test('is not part of the generic calculateTravelStats payload', () => {
    const stats = calculateTravelStats([lineTravel('152', 'bus', 10, 20)]);

    assert.strictEqual('byLine' in stats, false);
  });

  await t.test('returns an empty ranking when no bus travel has a line', () => {
    const byLine = calculateByLineStats([lineTravel('99', 'car')]);

    assert.deepStrictEqual(byLine, []);
  });
});
