import test from 'node:test';
import assert from 'node:assert';
import { CrossRules } from '../domain/crossRules.js';

test('CrossRules.validateDeletable', async (t) => {
  await t.test('should not throw error if no travels reference the cross', () => {
    assert.doesNotThrow(() => CrossRules.validateDeletable(0));
  });

  await t.test('should throw error if any travel references the cross', () => {
    assert.throws(() => CrossRules.validateDeletable(1), /Cannot delete cross: It has 1 associated travel\(s\)\./);
  });

  await t.test('should report the amount of travels referencing the cross', () => {
    assert.throws(() => CrossRules.validateDeletable(7), /It has 7 associated travel\(s\)/);
  });
});
