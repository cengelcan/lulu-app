import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { SUBSCRIPTION_PRODUCT_IDS } from '@/constants/subscription';
import { translate } from '@/i18n';
import { buildPaywallPlanCopy } from '@/utils/paywall-billing';

describe('buildPaywallPlanCopy', () => {
  it('describes monthly billing without promising a trial', () => {
    const copy = buildPaywallPlanCopy(SUBSCRIPTION_PRODUCT_IDS.monthly, '$4.99', (key, params) =>
      translate('en', key, params)
    );

    assert.equal(copy.subtitle, 'Renews monthly');
    assert.equal(
      copy.disclosure,
      '$4.99 per month. Charged immediately and renews automatically each month until cancelled.'
    );
    assert.equal(copy.cta, 'Continue');
    assert.doesNotMatch(JSON.stringify(copy), /trial|free/i);
  });

  it('describes yearly billing with the localized store price', () => {
    const copy = buildPaywallPlanCopy(SUBSCRIPTION_PRODUCT_IDS.yearly, '24,99 €', (key, params) =>
      translate('de', key, params)
    );

    assert.equal(copy.subtitle, 'Jährliche Verlängerung');
    assert.equal(
      copy.disclosure,
      '24,99 € pro Jahr. Sofort zahlbar und verlängert sich automatisch jedes Jahr, sofern nicht gekündigt.'
    );
    assert.equal(copy.cta, 'Weiter');
    assert.doesNotMatch(JSON.stringify(copy), /trial|test|kostenlos/i);
  });

  it('separates lifetime access from subscriptions', () => {
    const copy = buildPaywallPlanCopy(SUBSCRIPTION_PRODUCT_IDS.lifetime, '$49.99', (key, params) =>
      translate('en', key, params)
    );

    assert.equal(copy.disclosure, 'One-time payment of $49.99. No subscription.');
    assert.equal(copy.cta, 'Get Lifetime Access');
  });
});
