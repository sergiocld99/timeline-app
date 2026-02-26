import test from 'node:test';
import assert from 'node:assert';
import { TravelRules } from '../domain/travelRules.js';

test('TravelRules.validateDuration', async (t) => {
  await t.test('should throw error if startTime is missing', () => {
    assert.throws(() => TravelRules.validateDuration(null, '2026-02-24T18:00:00Z'), /Start and end time are required/);
  });

  await t.test('should throw error if endTime is missing', () => {
    assert.throws(() => TravelRules.validateDuration('2026-02-24T18:00:00Z', null), /Start and end time are required/);
  });

  await t.test('should throw error if duration is negative', () => {
    const start = '2026-02-24T20:00:00Z';
    const end = '2026-02-24T18:00:00Z';
    assert.throws(() => TravelRules.validateDuration(start, end), /Travel duration cannot be negative/);
  });

  await t.test('should throw error if duration is zero', () => {
    const time = '2026-02-24T18:00:00Z';
    assert.throws(() => TravelRules.validateDuration(time, time), /Travel duration cannot be zero/);
  });

  await t.test('should throw error if duration exceeds 24 hours', () => {
    const start = '2026-02-24T18:00:00Z';
    const end = '2026-02-25T19:00:00Z'; // 25 hours
    assert.throws(() => TravelRules.validateDuration(start, end), /Travel duration cannot exceed 24 hours/);
  });

  await t.test('should not throw error if duration is valid', () => {
    const start = '2026-02-24T18:00:00Z';
    const end = '2026-02-24T19:00:00Z'; // 1 hour
    assert.doesNotThrow(() => TravelRules.validateDuration(start, end));
  });
});
