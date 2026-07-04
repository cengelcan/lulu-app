import type { Href } from 'expo-router';

import { addDays } from '@/services/notifications/date';
import type { InboxItem, InboxProvider, InboxProviderInput, InboxTranslateFn } from '@/types/inbox';
import type { Pet } from '@/types/pet';
import type { PetReminder } from '@/types/pet-reminder';
import { formatLocalDate } from '@/utils/date';
import { getReminderFormRoute } from '@/utils/pet-reminder-display';
import {
  buildOverdueReminders,
  buildUpcomingReminders,
} from '@/utils/upcoming-reminders';

const CHECK_IN_ROUTE = '/check-in' as Href;
const SETTINGS_ROUTE = '/settings' as Href;

function getActivePets(pets: Pet[]): Pet[] {
  return pets.filter((pet) => pet.status !== 'deceased');
}

function hasCheckInOnDate(checkIns: InboxProviderInput['checkIns'], petId: string, dateKey: string): boolean {
  return checkIns.some((checkIn) => checkIn.petId === petId && checkIn.date === dateKey);
}

function buildMissedCheckInItems(
  activePets: Pet[],
  checkIns: InboxProviderInput['checkIns'],
  todayKey: string,
  yesterdayKey: string,
  referenceDate: Date
): InboxItem[] {
  const items: InboxItem[] = [];

  for (const pet of activePets) {
    const hasToday = hasCheckInOnDate(checkIns, pet.id, todayKey);

    if (!hasToday) {
      items.push({
        id: `missed_check_in_today:${pet.id}`,
        source: 'personal',
        category: 'action_required',
        kind: 'missed_check_in_today',
        priority: 'urgent',
        petId: pet.id,
        petName: pet.name,
        titleKey: 'inbox.missedCheckInToday',
        titleParams: { name: pet.name },
        route: CHECK_IN_ROUTE,
        sortAt: referenceDate.toISOString(),
        createdAt: referenceDate.toISOString(),
      });
      continue;
    }

    const hasYesterday = hasCheckInOnDate(checkIns, pet.id, yesterdayKey);
    if (!hasYesterday) {
    const yesterdayDate = addDays(new Date(referenceDate), -1);
    yesterdayDate.setHours(0, 0, 0, 0);
      items.push({
        id: `missed_check_in_yesterday:${pet.id}`,
        source: 'personal',
        category: 'action_required',
        kind: 'missed_check_in_yesterday',
        priority: 'normal',
        petId: pet.id,
        petName: pet.name,
        titleKey: 'inbox.missedCheckInYesterday',
        titleParams: { name: pet.name },
        route: CHECK_IN_ROUTE,
        sortAt: yesterdayDate.toISOString(),
        createdAt: yesterdayDate.toISOString(),
      });
    }
  }

  return items;
}

function buildReminderSortAt(reminder: PetReminder): string {
  const hour = String(reminder.dueTime.hour).padStart(2, '0');
  const minute = String(reminder.dueTime.minute).padStart(2, '0');
  return `${reminder.dueDate}T${hour}:${minute}:00.000`;
}

function buildOverdueReminderItems(
  reminders: PetReminder[],
  reminderById: Map<string, PetReminder>,
  petNameById: Map<string, string>,
  locale: string,
  t: InboxTranslateFn,
  referenceDate: Date
): InboxItem[] {
  const overdue = buildOverdueReminders(reminders, locale, t, { referenceDate });

  return overdue.map((reminder) => {
    const sourceReminder = reminderById.get(reminder.reminderId);
    const petName = sourceReminder ? petNameById.get(sourceReminder.petId) : undefined;

    return {
      id: `overdue_reminder:${reminder.reminderId}`,
      source: 'personal',
      category: 'action_required',
      kind: 'overdue_reminder',
      priority: 'urgent',
      petId: sourceReminder?.petId ?? null,
      petName: petName ?? null,
      titleKey: 'inbox.overdueReminder',
      titleParams: { title: reminder.title },
      subtitleKey: petName ? 'inbox.reminderForPet' : undefined,
      subtitleParams: petName ? { name: petName } : undefined,
      route: getReminderFormRoute(reminder.reminderType, reminder.reminderId) as Href,
      sortAt: sourceReminder ? buildReminderSortAt(sourceReminder) : referenceDate.toISOString(),
      createdAt: referenceDate.toISOString(),
    };
  });
}

function buildUpcomingReminderItems(
  reminders: PetReminder[],
  reminderById: Map<string, PetReminder>,
  petNameById: Map<string, string>,
  locale: string,
  t: InboxTranslateFn,
  referenceDate: Date
): InboxItem[] {
  const upcoming = buildUpcomingReminders(reminders, locale, t, {
    referenceDate,
    withinDays: 1,
  });

  return upcoming.map((reminder) => {
    const sourceReminder = reminderById.get(reminder.reminderId);
    const petName = sourceReminder ? petNameById.get(sourceReminder.petId) : undefined;

    return {
      id: `upcoming_reminder:${reminder.reminderId}`,
      source: 'personal',
      category: 'upcoming',
      kind: 'upcoming_reminder',
      priority: 'low',
      petId: sourceReminder?.petId ?? null,
      petName: petName ?? null,
      titleKey: 'inbox.upcomingReminder',
      titleParams: {
        title: reminder.title,
        dateLabel: reminder.dateLabel,
      },
      subtitleKey: petName ? 'inbox.reminderForPet' : undefined,
      subtitleParams: petName ? { name: petName } : undefined,
      route: getReminderFormRoute(reminder.reminderType, reminder.reminderId) as Href,
      sortAt: sourceReminder ? buildReminderSortAt(sourceReminder) : referenceDate.toISOString(),
      createdAt: referenceDate.toISOString(),
    };
  });
}

function buildPermissionDeniedItem(referenceDate: Date): InboxItem {
  return {
    id: 'notification_permission_denied',
    source: 'personal',
    category: 'action_required',
    kind: 'notification_permission_denied',
    priority: 'normal',
    petId: null,
    petName: null,
    titleKey: 'inbox.permissionDenied',
    subtitleKey: 'inbox.permissionDeniedSubtitle',
    route: SETTINGS_ROUTE,
    sortAt: referenceDate.toISOString(),
    createdAt: referenceDate.toISOString(),
  };
}

export const buildPersonalActionItems: InboxProvider = (input) => {
  const activePets = getActivePets(input.pets);
  if (activePets.length === 0 && input.permission !== 'denied') {
    return [];
  }

  const referenceDate = input.referenceDate;
  const today = new Date(referenceDate);
  today.setHours(0, 0, 0, 0);
  const todayKey = formatLocalDate(today);
  const yesterdayKey = formatLocalDate(addDays(today, -1));
  const activePetIds = new Set(activePets.map((pet) => pet.id));
  const petNameById = new Map(activePets.map((pet) => [pet.id, pet.name]));

  const activeReminders = input.reminders.filter((reminder) => activePetIds.has(reminder.petId));
  const reminderById = new Map(activeReminders.map((reminder) => [reminder.id, reminder]));

  const items: InboxItem[] = [
    ...buildMissedCheckInItems(activePets, input.checkIns, todayKey, yesterdayKey, referenceDate),
    ...buildOverdueReminderItems(
      activeReminders,
      reminderById,
      petNameById,
      input.locale,
      input.t,
      referenceDate
    ),
    ...buildUpcomingReminderItems(
      activeReminders,
      reminderById,
      petNameById,
      input.locale,
      input.t,
      referenceDate
    ),
  ];

  if (input.permission === 'denied') {
    items.push(buildPermissionDeniedItem(referenceDate));
  }

  return items;
};
