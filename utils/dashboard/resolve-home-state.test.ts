import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { Pet } from '@/types/pet';
import { resolveHomeState } from '@/utils/dashboard/resolve-home-state';

const pet: Pet = {
  id: 'pet-1',
  name: 'Lulu',
  species: 'cat',
  ageGroup: '4_7_years',
  healthConditions: ['none'],
  status: 'active',
  createdAt: '2026-01-01T00:00:00.000Z',
};

describe('resolveHomeState', () => {
  it('resolves the no-pet and new-pet states', () => {
    assert.equal(resolveHomeState({ pet: null, hasCareData: false }), 'no_pet');
    assert.equal(resolveHomeState({ pet, hasCareData: false }), 'new');
  });

  it('resolves active pets when care data exists', () => {
    assert.equal(resolveHomeState({ pet, hasCareData: true }), 'active');
  });

  it('gives memorial and shared roles precedence over data volume', () => {
    assert.equal(
      resolveHomeState({ pet: { ...pet, status: 'deceased' }, hasCareData: true }),
      'memorial'
    );
    assert.equal(
      resolveHomeState({ pet: { ...pet, sharingRole: 'member' }, hasCareData: false }),
      'shared'
    );
  });
});
