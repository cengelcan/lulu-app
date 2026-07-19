import assert from 'node:assert/strict';
import test from 'node:test';

import { AccessibilityTokens } from './accessibility';

test('interactive size tokens preserve the iOS minimum touch target', () => {
  assert.ok(AccessibilityTokens.minimumTouchTarget >= 44);
  assert.ok(AccessibilityTokens.comfortableTouchTarget >= AccessibilityTokens.minimumTouchTarget);
});
