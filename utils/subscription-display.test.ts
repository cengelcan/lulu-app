import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  formatSubscriptionDate,
  getPlanLabelKey,
  isIntroOrTrialPeriod,
  projectNextRenewalDate,
} from './subscription-display';
import type { RegionalFormatContext } from '@/utils/regional-format';

const turkishUsRegionalFormat: RegionalFormatContext = {
  language: 'tr', languageLocale: 'tr-TR', regionCode: 'US', datePartOrder: 'mdy',
  dateSeparator: '/', decimalSeparator: '.', digitGroupingSeparator: ',',
  measurementSystem: 'us', uses24HourClock: false, timeZone: 'UTC',
};

describe('monthly subscription display', () => {
  it('uses the monthly profile label', () => {
    assert.equal(getPlanLabelKey('monthly'), 'profile.luluPlusPlanMonthly');
  });

  it('uses app-language month names with the device-region date order', () => {
    assert.equal(
      formatSubscriptionDate('2026-07-27T12:00:00.000Z', turkishUsRegionalFormat),
      'Temmuz 27, 2026'
    );
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
