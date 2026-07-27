import assert from 'node:assert/strict';
import test from 'node:test';

import { shouldStackFormHeader } from './form-layout';

test('form headers stack only when width or text size is constrained', () => {
  assert.equal(shouldStackFormHeader(393, 1), false);
  assert.equal(shouldStackFormHeader(320, 1), true);
  assert.equal(shouldStackFormHeader(393, 1.4), true);
});
