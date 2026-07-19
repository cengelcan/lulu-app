import assert from 'node:assert/strict';
import test from 'node:test';

import { runInitialSetupFinalization } from '@/services/setup/finalize-initial-setup';

function createDependencies(events: string[], savePermission: () => Promise<'allowed'>) {
  return {
    createPet: async () => {
      events.push('createPet');
      return { id: 'pet-1' };
    },
    setActivePet: async (_pet: { id: string }) => {
      events.push('setActivePet');
    },
    savePermission,
    resetDraft: () => {
      events.push('resetDraft');
    },
    navigateToComplete: () => {
      events.push('navigateToComplete');
    },
  };
}

test('activates the new pet before configuring notifications', async () => {
  const events: string[] = [];
  const dependencies = createDependencies(events, async () => {
    events.push('savePermission');
    return 'allowed';
  });

  await runInitialSetupFinalization('allowed', dependencies);

  assert.deepEqual(events, [
    'createPet',
    'setActivePet',
    'savePermission',
    'resetDraft',
    'navigateToComplete',
  ]);
});

test('finishes onboarding when optional notification setup fails', async () => {
  const events: string[] = [];
  const dependencies = createDependencies(events, async () => {
    events.push('savePermission');
    throw new Error('native notification failure');
  });

  const resolvedPermission = await runInitialSetupFinalization('allowed', dependencies);

  assert.equal(resolvedPermission, 'allowed');
  assert.deepEqual(events, [
    'createPet',
    'setActivePet',
    'savePermission',
    'resetDraft',
    'navigateToComplete',
  ]);
});
