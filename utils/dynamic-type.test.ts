import assert from 'node:assert/strict';
import test from 'node:test';

import { getScaledLineHeight } from './dynamic-type';

test('scales line height with the active Dynamic Type scale', () => {
  assert.equal(getScaledLineHeight(24, 1.5, 2), 36);
});

test('caps line-height scaling at the same multiplier as the text', () => {
  assert.equal(getScaledLineHeight(24, 3.2, 2), 48);
});

test('preserves an unspecified line height', () => {
  assert.equal(getScaledLineHeight(undefined, 2, 2), undefined);
});
