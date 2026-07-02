import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  getCheckInReminderContent,
  getPetReminderNotificationContent,
} from '@/services/notifications/content';
import type { PetReminder } from '@/types/pet-reminder';

function createVaccineReminder(): PetReminder {
  return {
    id: 'reminder-1',
    petId: 'pet-1',
    type: 'vaccine',
    status: 'pending',
    dueDate: '2026-07-02',
    dueTime: { hour: 9, minute: 0 },
    notes: null,
    recurrence: { frequency: 'none' },
    completedAt: null,
    skippedAt: null,
    recordId: null,
    metadata: { vaccineName: '' },
    createdAt: '2026-07-01T00:00:00.000Z',
    updatedAt: '2026-07-01T00:00:00.000Z',
  };
}

describe('getCheckInReminderContent', () => {
  it('returns German body copy when language is de', () => {
    const { body } = getCheckInReminderContent('Luna', 'de');

    assert.match(body, /Luna/);
    assert.doesNotMatch(body, /^How is/);
  });

  it('returns English body copy when language is en', () => {
    const { body } = getCheckInReminderContent('Luna', 'en');

    assert.match(body, /Luna/);
    assert.match(body, /^How is/);
  });
});

describe('getPetReminderNotificationContent', () => {
  it('localizes reminder title and body for German', () => {
    const { title, body } = getPetReminderNotificationContent(createVaccineReminder(), 'Luna', 'de');

    assert.equal(title, 'Impfung');
    assert.match(body, /Luna/);
    assert.match(body, /Impfung/);
  });

  it('localizes reminder title and body for English', () => {
    const { title, body } = getPetReminderNotificationContent(createVaccineReminder(), 'Luna', 'en');

    assert.equal(title, 'Vaccine');
    assert.match(body, /Luna/);
    assert.match(body, /Vaccine/);
  });
});
