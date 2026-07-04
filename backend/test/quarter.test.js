import test from 'node:test';
import assert from 'node:assert';
import { parseQuarter, getQuarterKey } from '../domain/quarter.js';

test('parseQuarter', async (t) => {
  await t.test('should throw error for missing quarter', () => {
    assert.throws(() => parseQuarter(undefined), /Invalid quarter format/);
  });

  await t.test('should throw error for malformed quarter', () => {
    assert.throws(() => parseQuarter('2023-Q5'), /Invalid quarter format/);
    assert.throws(() => parseQuarter('2023-Q0'), /Invalid quarter format/);
    assert.throws(() => parseQuarter('2023-01'), /Invalid quarter format/);
  });

  await t.test('should resolve Q1 date range', () => {
    const { dateFrom, dateTo } = parseQuarter('2023-Q1');
    assert.strictEqual(dateFrom.toISOString(), '2023-01-01T00:00:00.000Z');
    assert.strictEqual(dateTo.toISOString(), '2023-03-31T23:59:59.999Z');
  });

  await t.test('should resolve Q4 date range', () => {
    const { dateFrom, dateTo } = parseQuarter('2023-Q4');
    assert.strictEqual(dateFrom.toISOString(), '2023-10-01T00:00:00.000Z');
    assert.strictEqual(dateTo.toISOString(), '2023-12-31T23:59:59.999Z');
  });

  await t.test('should account for leap years', () => {
    const { dateTo } = parseQuarter('2024-Q1');
    assert.strictEqual(dateTo.toISOString(), '2024-03-31T23:59:59.999Z');
  });
});

test('getQuarterKey', async (t) => {
  await t.test('should return the correct quarter key', () => {
    assert.strictEqual(getQuarterKey(new Date('2023-02-15T00:00:00.000Z')), '2023-Q1');
    assert.strictEqual(getQuarterKey(new Date('2023-06-30T00:00:00.000Z')), '2023-Q2');
    assert.strictEqual(getQuarterKey(new Date('2023-07-01T00:00:00.000Z')), '2023-Q3');
    assert.strictEqual(getQuarterKey(new Date('2023-12-31T00:00:00.000Z')), '2023-Q4');
  });
});
