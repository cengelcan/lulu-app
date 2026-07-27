import assert from 'node:assert/strict';
import test from 'node:test';

import { buildHealthConditionSummary, getActiveHealthConditions } from './pet-health-summary';

test('none is not presented as an active health condition', () => {
  assert.deepEqual(getActiveHealthConditions(['none']), []);
  assert.deepEqual(getActiveHealthConditions(['none', 'allergy']), ['allergy']);
});

test('health summary collapses long lists and reports the hidden count', () => {
  assert.deepEqual(
    buildHealthConditionSummary(
      ['kidney_disease', 'diabetes', 'allergy', 'heart_disease', 'arthritis'],
      false
    ),
    {
      visible: ['kidney_disease', 'diabetes', 'allergy'],
      hiddenCount: 2,
    }
  );
});

test('expanded health summary exposes every active condition', () => {
  assert.deepEqual(
    buildHealthConditionSummary(['kidney_disease', 'diabetes', 'allergy', 'other'], true),
    {
      visible: ['kidney_disease', 'diabetes', 'allergy', 'other'],
      hiddenCount: 0,
    }
  );
});
