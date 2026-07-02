import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { isAllowedIdenticalKey } from '@/i18n/allowed-identical-keys';
import { flattenTranslations } from '@/i18n/scripts/flatten-translations';
import { translate } from '@/i18n';
import { de } from '@/i18n/de';
import { en } from '@/i18n/en';

describe('paywall i18n', () => {
  it('translates all paywall keys to German (except allowlisted brand/symbols)', () => {
    const enFlat = flattenTranslations(en as unknown as Record<string, unknown>);
    const paywallKeys = [...enFlat.keys()].filter((key) => key.startsWith('paywall.'));

    for (const key of paywallKeys) {
      const enValue = translate('en', key);
      const deValue = translate('de', key);

      if (isAllowedIdenticalKey(key)) {
        continue;
      }

      assert.notEqual(
        deValue,
        enValue,
        `Expected German translation for ${key}, got English: "${deValue}"`
      );
    }
  });
});
