import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  getPlanLabelKey,
  isIntroOrTrialPeriod,
  projectNextRenewalDate,
} from './subscription-display';

describe('monthly subscription display', () => {
  it('uses the monthly profile label', () => {
    assert.equal(getPlanLabelKey('monthly'), 'profile.luluPlusPlanMonthly');
  });

  it('projects the next monthly renewal without skipping short months', () => {
    const renewal = projectNextRenewalDate('2027-01-31T12:00:00.000Z', 'monthly');

    assert.ok(renewal);
    assert.equal(renewal.getUTCFullYear(), 2027);
    assert.equal(renewal.getUTCMonth(), 1);
    assert.equal(renewal.getUTCDate(), 28);
  });

  it('does not classify accelerated Test Store renewal as a free trial', () => {
    const purchasedAt = '2026-07-19T16:30:00.000Z';
    const acceleratedExpiry = '2026-07-19T16:35:00.000Z';

    assert.equal(
      isIntroOrTrialPeriod('NORMAL', 'monthly', purchasedAt, acceleratedExpiry),
      false
    );
    assert.equal(
      isIntroOrTrialPeriod(0, 'monthly', purchasedAt, acceleratedExpiry),
      false
    );
  });
});
