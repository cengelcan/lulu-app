import assert from 'node:assert/strict';
import test from 'node:test';

import { getPaywallLayout } from './paywall-layout';

test('paywall keeps the compact three-plan layout at standard iPhone sizing', () => {
  assert.deepEqual(getPaywallLayout(393, 1), {
    stackFeatures: false,
    stackPlans: false,
    stackTrustBadges: false,
  });
});

test('paywall stacks dense content for small screens and large text', () => {
  assert.equal(getPaywallLayout(320, 1).stackPlans, true);
  assert.equal(getPaywallLayout(393, 1.4).stackPlans, true);
  assert.equal(getPaywallLayout(393, 1.4).stackFeatures, true);
  assert.equal(getPaywallLayout(393, 1.4).stackTrustBadges, true);
});
