import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { LULU_PLUS_BENEFITS } from '@/constants/plus-benefits';
import { de } from '@/i18n/de';
import { en } from '@/i18n/en';
import { tr } from '@/i18n/tr';
import { evaluatePlusFeature } from '@/utils/subscription-feature-evaluation';

describe('LULU_PLUS_BENEFITS', () => {
  it('lists only currently enforced Plus benefits', () => {
    assert.deepEqual(
      LULU_PLUS_BENEFITS.map((feature) => feature.titleKey),
      [
        'paywall.smartRemindersTitle',
        'paywall.advancedReportsTitle',
        'paywall.vetVisitWorkspaceTitle',
        'paywall.familySharingTitle',
        'paywall.longerHistoryTitle',
        'paywall.multiplePetsTitle',
      ]
    );
  });

  it('states the 10-pet safety cap in every supported language', () => {
    for (const catalog of [en, de, tr]) {
      assert.match(catalog.paywall.multiplePetsDescription, /10/);
      assert.match(catalog.paywall.plusPetLimit, /10/);
    }
  });

  it('gates new Vet Visit workspaces to Plus', () => {
    const base = { ownedActivePetCount: 1, recordsThisMonth: 0, remindersThisMonth: 0 };
    assert.equal(evaluatePlusFeature('vetVisitWorkspace', { ...base, isPlusActive: false }), false);
    assert.equal(evaluatePlusFeature('vetVisitWorkspace', { ...base, isPlusActive: true }), true);
  });
});
