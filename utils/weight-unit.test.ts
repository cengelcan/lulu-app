import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  convertWeight,
  fromKilograms,
  roundWeightForDisplay,
  toKilograms,
} from '@/utils/weight-unit';

describe('weight unit conversion', () => {
  it('converts kilograms and pounds without rounding the source value', () => {
    assert.ok(Math.abs(fromKilograms(10, 'lb') - 22.046226218487757) < 1e-12);
    assert.ok(Math.abs(toKilograms(22.046226218487757, 'lb') - 10) < 1e-12);
  });

  it('round-trips from the original source without drift', () => {
    const sourceKg = 4.75;
    const pounds = convertWeight(sourceKg, 'kg', 'lb');
    const restoredKg = convertWeight(pounds, 'lb', 'kg');

    assert.ok(Math.abs(restoredKg - sourceKg) < 1e-12);
  });

  it('rounds only the display value', () => {
    const source = convertWeight(4.75, 'kg', 'lb');

    assert.equal(roundWeightForDisplay(source), 10.5);
    assert.notEqual(source, 10.5);
  });
});
