import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { resolveFamilyJoinIntent } from '@/utils/sharing/family-join-intent';

describe('resolveFamilyJoinIntent', () => {
  it('routes an anonymous user to auth with the normalized code', () => {
    assert.deepEqual(resolveFamilyJoinIntent('luluapp://join/abc-234', false), {
      code: 'ABC234',
      route: '/(auth)?joinCode=ABC234',
      processingKey: 'anonymous:ABC234',
    });
  });

  it('routes an authenticated user to the join confirmation', () => {
    assert.deepEqual(resolveFamilyJoinIntent('https://lulu.pet/join/XYZ789', true), {
      code: 'XYZ789',
      route: '/join-family?code=XYZ789',
      processingKey: 'authenticated:XYZ789',
    });
  });

  it('rejects malformed and unsupported family codes', () => {
    assert.equal(resolveFamilyJoinIntent('luluapp://join/ABC', false), null);
    assert.equal(resolveFamilyJoinIntent('luluapp://join/ABC010', false), null);
    assert.equal(resolveFamilyJoinIntent('luluapp://check-in', true), null);
  });
});
