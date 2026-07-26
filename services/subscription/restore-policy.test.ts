import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { assertUserInitiatedSubscriptionRestore } from '@/services/subscription/restore-policy';

describe('subscription restore policy', () => {
  it('allows restore after an explicit user action', () => {
    assert.doesNotThrow(() => assertUserInitiatedSubscriptionRestore('user_action'));
  });

  it('blocks restore during account session initialization', () => {
    assert.throws(
      () => assertUserInitiatedSubscriptionRestore('session_initialization'),
      /subscription_restore_requires_user_action/
    );
  });
});
