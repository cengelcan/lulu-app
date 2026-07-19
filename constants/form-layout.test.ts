import assert from 'node:assert/strict';
import test from 'node:test';

import {
  shouldCompactOnboardingVisual,
  shouldStackFormHeader,
} from './form-layout';

test('form headers stack only when width or text size is constrained', () => {
  assert.equal(shouldStackFormHeader(393, 1), false);
  assert.equal(shouldStackFormHeader(320, 1), true);
  assert.equal(shouldStackFormHeader(393, 1.4), true);
});

test('onboarding artwork compacts when vertical space or text size is constrained', () => {
  assert.equal(shouldCompactOnboardingVisual(852, 1), false);
  assert.equal(shouldCompactOnboardingVisual(667, 1), true);
  assert.equal(shouldCompactOnboardingVisual(852, 1.3), true);
});
