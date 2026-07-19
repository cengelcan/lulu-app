import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { CheckIn } from '@/types/check-in';
import type { PetReminder, ReminderTypeId } from '@/types/pet-reminder';
import { buildNextCareAction } from '@/utils/dashboard/build-next-care-action';

const referenceDate = new Date(2026, 6, 19, 12, 0, 0);

function createReminder(
  id: string,
  type: ReminderTypeId,
  dueDate: string,
  hour = 9
): PetReminder {
  const metadata =
    type === 'medication'
      ? { medicationName: 'Medicine' }
      : type === 'vaccine'
        ? { vaccineName: 'Vaccine' }
        : type === 'custom'
          ? { title: 'Care task' }
          : type === 'parasite'
            ? { productName: 'Product' }
            : { title: 'Visit', clinicName: null };

  return {
    id,
    petId: 'pet-1',
    type,
    dueDate,
    dueTime: { hour, minute: 0 },
    recurrence: { frequency: 'none' },
    status: 'pending',
    metadata,
    createdAt: '2026-07-01T10:00:00.000Z',
    updatedAt: '2026-07-01T10:00:00.000Z',
  } as PetReminder;
}

const todayCheckIn = {
  id: 'check-in-1',
  petId: 'pet-1',
  date: '2026-07-19',
  appetite: 'normal',
  waterIntake: 'normal',
  energy: 'normal',
  mood: 'normal',
  pee: 'normal',
  poop: 'normal',
  createdAt: '2026-07-19T08:00:00.000Z',
} satisfies CheckIn;

describe('buildNextCareAction', () => {
  it('prioritizes overdue medication over older overdue reminders', () => {
    const action = buildNextCareAction({
      todayCheckIn: null,
      reminders: [
        createReminder('vaccine', 'vaccine', '2026-07-17'),
        createReminder('medicine', 'medication', '2026-07-18'),
      ],
      referenceDate,
    });

    assert.equal(action.kind, 'overdue_medication');
    assert.equal(action.kind === 'overdue_medication' ? action.reminder.id : null, 'medicine');
    assert.equal(action.kind === 'overdue_medication' ? action.overdueCount : null, 2);
  });

  it('prioritizes any overdue reminder before check-in', () => {
    const action = buildNextCareAction({
      todayCheckIn: null,
      reminders: [createReminder('vaccine', 'vaccine', '2026-07-18')],
      referenceDate,
    });

    assert.equal(action.kind, 'overdue_reminder');
  });

  it('asks for check-in before an upcoming reminder', () => {
    const action = buildNextCareAction({
      todayCheckIn: null,
      reminders: [createReminder('visit', 'vet_visit', '2026-07-20')],
      referenceDate,
    });

    assert.equal(action.kind, 'check_in');
  });

  it('returns the earliest upcoming reminder after check-in', () => {
    const action = buildNextCareAction({
      todayCheckIn,
      reminders: [
        createReminder('later', 'custom', '2026-07-22'),
        createReminder('next', 'vet_visit', '2026-07-20'),
      ],
      referenceDate,
    });

    assert.equal(action.kind, 'upcoming_reminder');
    assert.equal(action.kind === 'upcoming_reminder' ? action.reminder.id : null, 'next');
  });

  it('returns a calm complete state when no action remains', () => {
    const action = buildNextCareAction({ todayCheckIn, reminders: [], referenceDate });

    assert.deepEqual(action, { kind: 'all_complete' });
  });
});
