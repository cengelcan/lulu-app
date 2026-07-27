import assert from 'node:assert/strict';
import test from 'node:test';

import { shouldSendMedicationRefillNotification } from './medication-refill-policy';

test('refill notification fires only when stock crosses onto the threshold', () => {
  assert.equal(shouldSendMedicationRefillNotification(3, 3), true);
  assert.equal(shouldSendMedicationRefillNotification(4, 3), false);
  assert.equal(shouldSendMedicationRefillNotification(2, 3), false);
});
