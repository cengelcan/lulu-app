import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { resolveEnabledFlag } from '@/constants/feature-flags';

describe('resolveEnabledFlag', () => {
  it('uses the default when no value is configured', () => {
    assert.equal(resolveEnabledFlag(undefined, true), true);
    assert.equal(resolveEnabledFlag(undefined, false), false);
  });

  it('allows an explicit false value to disable a rollout', () => {
    assert.equal(resolveEnabledFlag('false', true), false);
    assert.equal(resolveEnabledFlag(' FALSE ', true), false);
  });

  it('treats any configured non-false value as enabled', () => {
    assert.equal(resolveEnabledFlag('true', false), true);
    assert.equal(resolveEnabledFlag('1', false), true);
  });
});
