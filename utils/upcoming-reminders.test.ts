import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { PetRecord } from '@/types/pet-record';
import { buildUpcomingReminders, hasUpcomingReminders } from '@/utils/upcoming-reminders';

const REFERENCE_DATE = new Date('2026-06-23T12:00:00');

const t = (key: string) => key;

function createRecord(overrides: Partial<PetRecord> & Pick<PetRecord, 'type' | 'date'>): PetRecord {
  const base = {
    id: overrides.id ?? `record-${overrides.type}-${overrides.date}`,
    petId: 'pet-1',
    date: overrides.date,
    notes: null,
    createdAt: `${overrides.date}T10:00:00.000Z`,
    updatedAt: `${overrides.date}T10:00:00.000Z`,
  };

  switch (overrides.type) {
    case 'vet_visit':
      return {
        ...base,
        type: 'vet_visit',
        metadata: overrides.metadata ?? { clinicName: 'Clinic', reason: null },
      } as PetRecord;
    case 'vaccine':
      return {
        ...base,
        type: 'vaccine',
        metadata: overrides.metadata ?? { vaccineName: 'Rabies' },
      } as PetRecord;
    case 'medication':
      return {
        ...base,
        type: 'medication',
        metadata: overrides.metadata ?? { medicationName: 'Parasite pill' },
      } as PetRecord;
    default:
      throw new Error(`Unsupported record type in test helper: ${overrides.type}`);
  }
}

describe('buildUpcomingReminders', () => {
  it('returns future record dates sorted by reminder date', () => {
    const records = [
      createRecord({ id: 'vet-1', type: 'vet_visit', date: '2026-06-25' }),
      createRecord({ id: 'vac-1', type: 'vaccine', date: '2026-06-10', metadata: { vaccineName: 'Rabies', nextDueDate: '2026-06-24' } }),
    ];

    const items = buildUpcomingReminders(records, 'en-US', t, {
      referenceDate: REFERENCE_DATE,
    });

    assert.equal(items.length, 2);
    assert.equal(items[0]?.reminderDate, '2026-06-24');
    assert.equal(items[1]?.reminderDate, '2026-06-25');
  });

  it('ignores past record dates and includes medication end dates', () => {
    const records = [
      createRecord({
        id: 'med-1',
        type: 'medication',
        date: '2026-06-01',
        metadata: { medicationName: 'Dewormer', endDate: '2026-06-30' },
      }),
      createRecord({ id: 'vet-past', type: 'vet_visit', date: '2026-06-01' }),
    ];

    const items = buildUpcomingReminders(records, 'en-US', t, {
      referenceDate: REFERENCE_DATE,
    });

    assert.equal(items.length, 1);
    assert.equal(items[0]?.reminderDate, '2026-06-30');
    assert.equal(items[0]?.title, 'Dewormer');
  });

  it('reports whether any upcoming reminders exist', () => {
    const records = [
      createRecord({ id: 'vet-past', type: 'vet_visit', date: '2026-06-01' }),
    ];

    assert.equal(hasUpcomingReminders(records, REFERENCE_DATE), false);
    assert.equal(
      hasUpcomingReminders(
        [...records, createRecord({ id: 'vet-future', type: 'vet_visit', date: '2026-06-30' })],
        REFERENCE_DATE
      ),
      true
    );
  });
});
