import assert from 'node:assert/strict';
import test from 'node:test';

import { CONTENT_STATE_KINDS } from './content-states';

test('shared content state contract covers every required UI state', () => {
  assert.deepEqual(CONTENT_STATE_KINDS, ['loading', 'error', 'empty', 'locked']);
});
