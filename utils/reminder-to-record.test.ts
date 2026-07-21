import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { PetReminder } from '@/types/pet-reminder';
import { reminderToRecord } from '@/utils/reminder-to-record';

function createReminder(type: PetReminder['type']): PetReminder {
  const metadata =
    type === 'custom'
      ? { title: 'Tırnakları kontrol et' }
      : { clinicName: 'Lulu Vet', title: 'Kontrol' };

  return {
    id: 'reminder-1',
    petId: 'pet-1',
    type,
    dueDate: '2026-07-21',
    dueTime: { hour: 10, minute: 0 },
    recurrence: { frequency: 'none' },
    notes: null,
    status: 'pending',
    completedAt: null,
    recordId: null,
    metadata,
    createdAt: '2026-07-20T10:00:00.000Z',
    updatedAt: '2026-07-20T10:00:00.000Z',
  } as PetReminder;
}

describe('reminderToRecord', () => {
  it('does not turn a custom reminder into a veterinary record', () => {
    assert.equal(
      reminderToRecord(createReminder('custom'), '2026-07-21T10:00:00.000Z'),
      null
    );
  });

  it('still turns a veterinary reminder into a veterinary record', () => {
    const record = reminderToRecord(
      createReminder('vet_visit'),
      '2026-07-21T10:00:00.000Z'
    );

    assert.equal(record?.type, 'vet_visit');
  });
});
