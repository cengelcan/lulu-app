import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { PetReminder } from '@/types/pet-reminder';
import { buildUpcomingReminders, hasUpcomingReminders } from '@/utils/upcoming-reminders';

const REFERENCE_DATE = new Date('2026-06-23T12:00:00');

const t = (key: string) => key;

function createReminder(
  overrides: Partial<PetReminder> & Pick<PetReminder, 'type' | 'dueDate'>
): PetReminder {
  const base = {
    ...overrides,
    id: overrides.id ?? `reminder-${overrides.type}-${overrides.dueDate}`,
    petId: 'pet-1',
    dueTime: { hour: 9, minute: 0 },
    notes: null,
    recurrence: { frequency: 'none' as const },
    status: 'pending' as const,
    completedAt: null,
    recordId: null,
    createdAt: `${overrides.dueDate}T10:00:00.000Z`,
    updatedAt: `${overrides.dueDate}T10:00:00.000Z`,
  };

  switch (overrides.type) {
    case 'vet_visit':
      return {
        ...base,
        type: 'vet_visit',
        metadata: overrides.metadata ?? { title: 'Vet check', clinicName: null },
      } as PetReminder;
    case 'vaccine':
      return {
        ...base,
        type: 'vaccine',
        metadata: overrides.metadata ?? { vaccineName: 'Rabies' },
      } as PetReminder;
    case 'medication':
      return {
        ...base,
        type: 'medication',
        metadata: overrides.metadata ?? { medicationName: 'Dewormer' },
      } as PetReminder;
    case 'parasite':
      return {
        ...base,
        type: 'parasite',
        metadata: overrides.metadata ?? { productName: 'Flea treatment' },
      } as PetReminder;
    case 'custom':
      return {
        ...base,
        type: 'custom',
        metadata: overrides.metadata ?? { title: 'Nail trim' },
      } as PetReminder;
  }
}

describe('buildUpcomingReminders', () => {
  it('returns pending reminders within the next 7 days sorted by due date', () => {
    const reminders = [
      createReminder({ id: 'vet-1', type: 'vet_visit', dueDate: '2026-06-25' }),
      createReminder({ id: 'vac-1', type: 'vaccine', dueDate: '2026-06-24' }),
      createReminder({ id: 'old-1', type: 'medication', dueDate: '2026-06-01' }),
      createReminder({ id: 'far-1', type: 'custom', dueDate: '2026-08-01' }),
    ];

    const items = buildUpcomingReminders(reminders, 'en-US', t, {
      referenceDate: REFERENCE_DATE,
      withinDays: 7,
    });

    assert.equal(items.length, 2);
    assert.equal(items[0]?.dueDate, '2026-06-24');
    assert.equal(items[1]?.dueDate, '2026-06-25');
  });

  it('ignores completed reminders', () => {
    const reminders = [
      createReminder({
        id: 'done-1',
        type: 'vaccine',
        dueDate: '2026-06-24',
        status: 'completed',
        completedAt: '2026-06-20T10:00:00.000Z',
      }),
    ];

    const items = buildUpcomingReminders(reminders, 'en-US', t, {
      referenceDate: REFERENCE_DATE,
    });

    assert.equal(items.length, 0);
  });

  it('reports whether any upcoming reminders exist within 7 days', () => {
    const reminders = [
      createReminder({ id: 'past', type: 'vet_visit', dueDate: '2026-06-01' }),
    ];

    assert.equal(hasUpcomingReminders(reminders, REFERENCE_DATE), false);
    assert.equal(
      hasUpcomingReminders(
        [...reminders, createReminder({ id: 'soon', type: 'vet_visit', dueDate: '2026-06-30' })],
        REFERENCE_DATE
      ),
      true
    );
  });
});
