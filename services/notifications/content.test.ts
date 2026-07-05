import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  getCheckInReminderContent,
  getCheckInReminderContentForDate,
  getPetReminderNotificationContent,
} from '@/services/notifications/content';
import {
  CHECK_IN_REMINDER_VARIANT_COUNT,
  pickCheckInReminderVariantIndex,
} from '@/services/notifications/check-in-reminder-variants';
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

describe('pickCheckInReminderVariantIndex', () => {
  it('returns a stable index within the variant range', () => {
    const first = pickCheckInReminderVariantIndex('2026-07-05', 'pet-1');
    const second = pickCheckInReminderVariantIndex('2026-07-05', 'pet-1');

    assert.equal(first, second);
    assert.ok(first >= 0);
    assert.ok(first < CHECK_IN_REMINDER_VARIANT_COUNT);
  });

  it('can vary by date for the same pet', () => {
    const indices = new Set(
      ['2026-07-05', '2026-07-06', '2026-07-07', '2026-07-08', '2026-07-09'].map((dateKey) =>
        pickCheckInReminderVariantIndex(dateKey, 'pet-1')
      )
    );

    assert.ok(indices.size > 1);
  });
});

describe('getCheckInReminderContent', () => {
  it('returns German body copy when language is de', () => {
    const { body } = getCheckInReminderContent('Luna', 'de', 0);

    assert.match(body, /Luna/);
    assert.doesNotMatch(body, /^How is/);
  });

  it('returns English body copy when language is en', () => {
    const { body } = getCheckInReminderContent('Luna', 'en', 0);

    assert.match(body, /Luna/);
    assert.match(body, /^How is/);
  });

  it('returns different variants for different indices', () => {
    const first = getCheckInReminderContent('Luna', 'en', 0).body;
    const second = getCheckInReminderContent('Luna', 'en', 1).body;

    assert.notEqual(first, second);
  });
});

describe('getCheckInReminderContentForDate', () => {
  it('picks a localized body for the given date key', () => {
    const { body } = getCheckInReminderContentForDate('Luna', 'pet-1', '2026-07-05', 'en');

    assert.match(body, /Luna/);
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
