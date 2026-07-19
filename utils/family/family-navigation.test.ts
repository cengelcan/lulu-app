import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  canAccessFamilyOwnerRoutes,
  resolveFamilyNavigationView,
} from '@/utils/family/family-navigation';

describe('resolveFamilyNavigationView', () => {
  it('shows an owner their active family regardless of entitlement refresh state', () => {
    const view = resolveFamilyNavigationView({
      hasOwnerGroup: true,
      hasMemberGroup: false,
      canUseFamilySharing: false,
    });

    assert.equal(view, 'active_owner');
    assert.equal(canAccessFamilyOwnerRoutes(view), true);
  });

  it('shows a member their active family without requiring their own Plus plan', () => {
    const view = resolveFamilyNavigationView({
      hasOwnerGroup: false,
      hasMemberGroup: true,
      canUseFamilySharing: false,
    });

    assert.equal(view, 'active_member');
    assert.equal(canAccessFamilyOwnerRoutes(view), false);
  });

  it('shows family setup to an entitled user with no group', () => {
    assert.equal(
      resolveFamilyNavigationView({
        hasOwnerGroup: false,
        hasMemberGroup: false,
        canUseFamilySharing: true,
      }),
      'setup'
    );
  });

  it('keeps the free-user upsell on the family intent surface', () => {
    assert.equal(
      resolveFamilyNavigationView({
        hasOwnerGroup: false,
        hasMemberGroup: false,
        canUseFamilySharing: false,
      }),
      'upsell'
    );
  });
});
