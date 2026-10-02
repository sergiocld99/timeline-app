import test from 'node:test';
import assert from 'node:assert';
import { CrossRules } from '../domain/crossRules.js';

test('CrossRules.validateDeletable', async (t) => {
  await t.test('should not throw error if no travels reference the cross', () => {
    assert.doesNotThrow(() => CrossRules.validateDeletable(0, null));
  });

  await t.test('should throw a singular error carrying the blocking travel date', () => {
    assert.throws(
      () => CrossRules.validateDeletable(1, '2026-02-24'),
      /Cannot delete cross: Its only associated travel is from 2026-02-24\./
    );
  });

  await t.test('should expose code and params for a single blocking travel', () => {
    try {
      CrossRules.validateDeletable(1, '2026-02-24');
      assert.fail('expected CrossRules.validateDeletable to throw');
    } catch (error) {
      assert.strictEqual(error.name, 'BusinessRuleError');
      assert.strictEqual(error.code, 'cross_has_associated_travel');
      assert.deepStrictEqual(error.params, { count: 1, date: '2026-02-24' });
    }
  });

  await t.test('should expose a plural code without date for several blocking travels', () => {
    try {
      CrossRules.validateDeletable(5, null);
      assert.fail('expected CrossRules.validateDeletable to throw');
    } catch (error) {
      assert.strictEqual(error.code, 'cross_has_associated_travels');
      assert.deepStrictEqual(error.params, { count: 5 });
    }
  });
});
