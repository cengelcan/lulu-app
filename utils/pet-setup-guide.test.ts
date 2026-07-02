import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { Pet } from '@/types/pet';
import type { PetRecord } from '@/types/pet-record';
import {
  getPetSetupGuideProgress,
  getPetSetupGuideTasks,
  isPetSetupGuideComplete,
  shouldShowPetSetupGuide,
} from '@/utils/pet-setup-guide';

const basePet: Pet = {
  id: 'pet-1',
  name: 'Lulu',
  species: 'cat',
  ageGroup: 'adult',
  healthConditions: ['none'],
  status: 'active',
  createdAt: '2026-01-01T00:00:00.000Z',
};

describe('getPetSetupGuideTasks', () => {
  it('marks tasks complete based on pet data', () => {
    const records: PetRecord[] = [
      {
        id: 'weight-1',
        petId: 'pet-1',
        type: 'weight',
        date: '2026-01-02',
        metadata: { value: 4, unit: 'kg' },
        createdAt: '2026-01-02T00:00:00.000Z',
      },
      {
        id: 'vaccine-1',
        petId: 'pet-1',
        type: 'vaccine',
        date: '2026-01-03',
        metadata: { vaccineName: 'Rabies' },
        createdAt: '2026-01-03T00:00:00.000Z',
      },
    ];

    const tasks = getPetSetupGuideTasks({
      pet: {
        ...basePet,
        photoUri: 'file:///photo.jpg',
        color: 'Black and white',
      },
      hasTodayCheckIn: true,
      records,
    });

    assert.equal(tasks.length, 5);
    assert.equal(tasks.every((task) => task.isCompleted), true);
    assert.equal(getPetSetupGuideProgress(tasks), 100);
    assert.equal(isPetSetupGuideComplete(tasks), true);
    assert.equal(shouldShowPetSetupGuide(tasks, false, false), false);
  });

  it('shows guide while tasks remain incomplete', () => {
    const tasks = getPetSetupGuideTasks({
      pet: basePet,
      hasTodayCheckIn: false,
      records: [],
    });

    assert.equal(getPetSetupGuideProgress(tasks), 0);
    assert.equal(shouldShowPetSetupGuide(tasks, false, false), true);
    assert.equal(shouldShowPetSetupGuide(tasks, true, false), false);
    assert.equal(shouldShowPetSetupGuide(tasks, false, true), false);
  });
});
