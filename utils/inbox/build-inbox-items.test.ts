import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { CheckIn } from '@/types/check-in';
import type { InboxProviderInput } from '@/types/inbox';
import type { Pet } from '@/types/pet';
import type { PetReminder } from '@/types/pet-reminder';
import {
  buildInboxItems,
  getActionRequiredCount,
} from '@/utils/inbox/build-inbox-items';

const REFERENCE_DATE = new Date('2026-06-23T12:00:00.000Z');
const TODAY_KEY = '2026-06-23';
const YESTERDAY_KEY = '2026-06-22';

const t = (key: string, params?: Record<string, string | number>) => {
  if (!params) {
    return key;
  }

  return `${key}:${JSON.stringify(params)}`;
};

function createPet(overrides: Partial<Pet> = {}): Pet {
  return {
    id: overrides.id ?? 'pet-1',
    name: overrides.name ?? 'Luna',
    species: 'cat',
    ageGroup: '1_3_years',
    healthConditions: ['none'],
    status: overrides.status ?? 'active',
    createdAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

function createCheckIn(overrides: Partial<CheckIn> = {}): CheckIn {
  return {
    id: overrides.id ?? 'check-in-1',
    petId: overrides.petId ?? 'pet-1',
    date: overrides.date ?? TODAY_KEY,
    appetite: 'normal',
    energy: 'normal',
    mood: 'normal',
    waterIntake: 'normal',
    poop: 'normal',
    pee: 'normal',
    notes: null,
    createdAt: '2026-06-23T08:00:00.000Z',
    ...overrides,
  };
}

function createReminder(
  overrides: Partial<PetReminder> & Pick<PetReminder, 'type' | 'dueDate'>
): PetReminder {
  const base = {
    ...overrides,
    id: overrides.id ?? `reminder-${overrides.type}-${overrides.dueDate}`,
    petId: overrides.petId ?? 'pet-1',
    dueTime: overrides.dueTime ?? { hour: 9, minute: 0 },
    notes: null,
    recurrence: { frequency: 'none' as const },
    status: (overrides.status ?? 'pending') as PetReminder['status'],
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

function createInput(overrides: Partial<InboxProviderInput> = {}): InboxProviderInput {
  return {
    pets: [createPet()],
    checkIns: [],
    reminders: [],
    permission: null,
    dismissedIds: new Set(),
    referenceDate: REFERENCE_DATE,
    locale: 'en-US',
    t,
    ...overrides,
  };
}

describe('buildInboxItems', () => {
  it('returns empty sections when there is nothing actionable', () => {
    const sections = buildInboxItems(
      createInput({
        checkIns: [
          createCheckIn({ date: TODAY_KEY }),
          createCheckIn({ id: 'check-in-yesterday', date: YESTERDAY_KEY }),
        ],
        reminders: [],
      })
    );

    assert.equal(sections.length, 0);
  });

  it('filters dismissed items', () => {
    const sections = buildInboxItems(
      createInput({
        dismissedIds: new Set(['missed_check_in_today:pet-1']),
      })
    );

    assert.equal(sections.length, 0);
  });

  it('sorts urgent items before normal items', () => {
    const sections = buildInboxItems(
      createInput({
        pets: [createPet({ id: 'pet-1', name: 'Luna' }), createPet({ id: 'pet-2', name: 'Max' })],
        checkIns: [createCheckIn({ petId: 'pet-2', date: TODAY_KEY })],
        reminders: [
          createReminder({ id: 'overdue-1', type: 'vaccine', dueDate: '2026-06-20', petId: 'pet-2' }),
        ],
      })
    );

    const actionItems = sections.find((section) => section.category === 'action_required')?.items;
    assert.ok(actionItems);
    assert.equal(actionItems[0]?.kind, 'missed_check_in_today');
    assert.equal(actionItems[1]?.kind, 'overdue_reminder');
  });

  it('counts action required items for the badge', () => {
    const sections = buildInboxItems(
      createInput({
        reminders: [createReminder({ id: 'upcoming-1', type: 'custom', dueDate: '2026-06-24' })],
      })
    );

    assert.equal(getActionRequiredCount(sections), 1);
    assert.equal(sections.some((section) => section.category === 'upcoming'), true);
  });
});

describe('buildPersonalActionItems via buildInboxItems', () => {
  it('shows only today missed check-in when both today and yesterday are missing', () => {
    const sections = buildInboxItems(createInput());
    const actionItems = sections.find((section) => section.category === 'action_required')?.items;

    assert.ok(actionItems);
    assert.equal(actionItems.length, 1);
    assert.equal(actionItems[0]?.kind, 'missed_check_in_today');
  });

  it('shows yesterday missed check-in only when today exists', () => {
    const sections = buildInboxItems(
      createInput({
        checkIns: [createCheckIn({ date: TODAY_KEY })],
      })
    );

    const actionItems = sections.find((section) => section.category === 'action_required')?.items;
    assert.ok(actionItems);
    assert.equal(actionItems.length, 1);
    assert.equal(actionItems[0]?.kind, 'missed_check_in_yesterday');
  });

  it('excludes deceased pets', () => {
    const sections = buildInboxItems(
      createInput({
        pets: [createPet({ status: 'deceased' })],
      })
    );

    assert.equal(sections.length, 0);
  });

  it('includes permission denied item', () => {
    const sections = buildInboxItems(
      createInput({
        permission: 'denied',
        pets: [],
      })
    );

    const actionItems = sections.find((section) => section.category === 'action_required')?.items;
    assert.ok(actionItems);
    assert.equal(actionItems[0]?.kind, 'notification_permission_denied');
  });

  it('creates separate missed check-in rows for multiple pets', () => {
    const sections = buildInboxItems(
      createInput({
        pets: [createPet({ id: 'pet-1', name: 'Luna' }), createPet({ id: 'pet-2', name: 'Max' })],
      })
    );

    const actionItems = sections.find((section) => section.category === 'action_required')?.items;
    assert.ok(actionItems);
    assert.equal(actionItems.length, 2);
  });
});
