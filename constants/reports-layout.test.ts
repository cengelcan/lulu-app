import assert from 'node:assert/strict';
import test from 'node:test';

import { shouldStackReportActions } from './reports-layout';

test('report actions stack only when horizontal space is constrained', () => {
  assert.equal(shouldStackReportActions(393, 1), false);
  assert.equal(shouldStackReportActions(320, 1), true);
  assert.equal(shouldStackReportActions(393, 1.4), true);
});
