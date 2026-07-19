import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { isAllowedIdenticalKey } from '@/i18n/allowed-identical-keys';
import { flattenTranslations } from '@/i18n/scripts/flatten-translations';
import { checkParity, checkTurkishParity } from '@/i18n/scripts/check-parity';
import { en } from '@/i18n/en';
import { de } from '@/i18n/de';
import { tr } from '@/i18n/tr';

describe('flattenTranslations', () => {
  it('flattens nested string leaves into dot paths', () => {
    const flat = flattenTranslations({
      common: { cancel: 'Cancel', nested: { ok: 'OK' } },
      reminders: ['First', 'Second'],
      count: 1,
    });

    assert.equal(flat.get('common.cancel'), 'Cancel');
    assert.equal(flat.get('common.nested.ok'), 'OK');
    assert.equal(flat.get('reminders[0]'), 'First');
    assert.equal(flat.get('reminders[1]'), 'Second');
    assert.equal(flat.size, 4);
  });
});

describe('isAllowedIdenticalKey', () => {
  it('allows exact brand keys', () => {
    assert.equal(isAllowedIdenticalKey('welcome.appName'), true);
  });

  it('allows breed prefix keys', () => {
    assert.equal(isAllowedIdenticalKey('pet.options.breeds.beagle'), true);
  });

  it('rejects ordinary UI keys', () => {
    assert.equal(isAllowedIdenticalKey('dashboard.greeting'), false);
  });
});

describe('checkParity', () => {
  it('reports no structural key mismatch between EN and DE catalogs', () => {
    const result = checkParity();

    assert.deepEqual(result.missingInDe, []);
    assert.deepEqual(result.missingInEn, []);
  });

  it('EN and DE catalogs have the same number of leaf keys', () => {
    const enFlat = flattenTranslations(en as unknown as Record<string, unknown>);
    const deFlat = flattenTranslations(de as unknown as Record<string, unknown>);

    assert.equal(enFlat.size, deFlat.size);
  });

  it('reports no structural key mismatch between EN and TR catalogs', () => {
    const result = checkTurkishParity();

    assert.deepEqual(result.missingInTr, []);
    assert.deepEqual(result.missingInEn, []);
  });

  it('EN and TR catalogs have the same number of leaf keys', () => {
    const enFlat = flattenTranslations(en as unknown as Record<string, unknown>);
    const trFlat = flattenTranslations(tr as unknown as Record<string, unknown>);

    assert.equal(enFlat.size, trFlat.size);
  });
});
