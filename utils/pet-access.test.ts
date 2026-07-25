import assert from 'node:assert/strict';
import test from 'node:test';

import { canWriteVetVisit } from '@/utils/pet-access';

test('pet owner can manage every active pet visit', () => {
  assert.equal(canWriteVetVisit(
    { sharingRole: 'owner', status: 'active' }, { createdByUserId: 'member-1' }, 'owner-1'
  ), true);
});

test('family member can manage only visits they created', () => {
  const pet = { sharingRole: 'member' as const, status: 'active' as const };
  assert.equal(canWriteVetVisit(pet, { createdByUserId: 'member-1' }, 'member-1'), true);
  assert.equal(canWriteVetVisit(pet, { createdByUserId: 'owner-1' }, 'member-1'), false);
});

test('deceased pet visits are read-only for everyone', () => {
  assert.equal(canWriteVetVisit(
    { sharingRole: 'owner', status: 'deceased' }, { createdByUserId: 'owner-1' }, 'owner-1'
  ), false);
});
