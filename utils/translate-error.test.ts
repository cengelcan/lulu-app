import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { translateError } from '@/utils/translate-error';

const t = (key: string, params?: Record<string, string | number>) => {
  if (key === 'errors.loadPets') {
    return 'Could not load pets.';
  }

  if (key === 'pet.validation.nameRequired') {
    return 'Name required';
  }

  if (key === 'pet.validation.nameMaxLength' && params?.max !== undefined) {
    return `Max ${params.max}`;
  }

  return key;
};

describe('translateError', () => {
  it('translates errors.* keys', () => {
    assert.equal(translateError(t, 'errors.loadPets'), 'Could not load pets.');
  });

  it('translates pet.validation.* keys with params', () => {
    assert.equal(translateError(t, 'pet.validation.nameMaxLength'), 'Max 30');
  });

  it('returns null for empty input', () => {
    assert.equal(translateError(t, null), null);
  });

  it('passes through unknown strings', () => {
    assert.equal(translateError(t, 'legacy message'), 'legacy message');
  });
});
