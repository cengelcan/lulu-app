import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { resolveLanguageCode } from '@/utils/resolve-language-code';

describe('resolveLanguageCode', () => {
  it('maps German device locales to de', () => {
    assert.equal(resolveLanguageCode('de'), 'de');
    assert.equal(resolveLanguageCode('DE'), 'de');
  });

  it('maps English device locales to en', () => {
    assert.equal(resolveLanguageCode('en'), 'en');
    assert.equal(resolveLanguageCode('EN'), 'en');
  });

  it('falls back to en for unsupported locales', () => {
    assert.equal(resolveLanguageCode('fr'), 'en');
    assert.equal(resolveLanguageCode('tr'), 'en');
    assert.equal(resolveLanguageCode('ja'), 'en');
  });

  it('falls back to en when language code is missing', () => {
    assert.equal(resolveLanguageCode(null), 'en');
    assert.equal(resolveLanguageCode(undefined), 'en');
    assert.equal(resolveLanguageCode(''), 'en');
  });
});
