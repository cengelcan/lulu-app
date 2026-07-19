import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { isAllowedIdenticalKey } from '@/i18n/allowed-identical-keys';
import { flattenTranslations } from '@/i18n/scripts/flatten-translations';
import { translate } from '@/i18n';
import { de } from '@/i18n/de';
import { en } from '@/i18n/en';
import { tr } from '@/i18n/tr';

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

  it('translates all paywall keys to Turkish (except allowlisted brand/symbols)', () => {
    const enFlat = flattenTranslations(en as unknown as Record<string, unknown>);
    const paywallKeys = [...enFlat.keys()].filter((key) => key.startsWith('paywall.'));

    for (const key of paywallKeys) {
      const enValue = translate('en', key);
      const trValue = translate('tr', key);

      if (isAllowedIdenticalKey(key)) {
        continue;
      }

      assert.notEqual(
        trValue,
        enValue,
        `Expected Turkish translation for ${key}, got English: "${trValue}"`
      );
    }
  });

  it('does not market an unavailable trial in any language', () => {
    const catalogs = [en, de, tr];

    for (const catalog of catalogs) {
      const paywallCopy = [...flattenTranslations(catalog as unknown as Record<string, unknown>)]
        .filter(([key]) => key.startsWith('paywall.'))
        .map(([, value]) => value)
        .join(' ');

      assert.doesNotMatch(paywallCopy, /free trial|\btrial\b|kostenlos testen|testphase/i);
    }
  });
});
