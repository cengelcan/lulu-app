import type { ActivityEvent } from '@/types/sharing';
import type { InboxItem, InboxProvider } from '@/types/inbox';
import type { Pet } from '@/types/pet';

const EVENT_KIND_MAP = {
  check_in_created: 'family_check_in_created',
  check_in_updated: 'family_check_in_updated',
  record_created: 'family_record_created',
  reminder_completed: 'family_reminder_completed',
  invite_accepted: 'family_invite_accepted',
  member_left: 'family_member_left',
} as const;

function findPetName(pets: Pet[], petId: string): string | null {
  return pets.find((pet) => pet.id === petId)?.name ?? null;
}

function buildRoute(event: ActivityEvent): InboxItem['route'] {
  switch (event.eventType) {
    case 'check_in_created':
    case 'check_in_updated':
      return '/check-in';
    case 'record_created':
      return '/records';
    case 'reminder_completed':
      return '/reminders';
    default:
      return '/(tabs)/home';
  }
}

export const buildFamilyActivityItems: InboxProvider = (input) => {
  const activityEvents = input.activityEvents ?? [];
  const currentUserId = input.currentUserId;
  const actorDisplayNames = input.actorDisplayNames ?? new Map<string, string | null>();

  if (activityEvents.length === 0) {
    return [];
  }

  const items: InboxItem[] = [];

  for (const event of activityEvents) {
    if (currentUserId && event.actorUserId === currentUserId) {
      continue;
    }

    if (input.dismissedIds.has(`family-${event.id}`)) {
      continue;
    }

    const kind = EVENT_KIND_MAP[event.eventType as keyof typeof EVENT_KIND_MAP];

    if (!kind) {
      continue;
    }

    const actorDisplayName = actorDisplayNames.get(event.actorUserId) ?? input.t('sharing.someone');
    const petName = findPetName(input.pets, event.petId);

    items.push({
      id: `family-${event.id}`,
      source: 'family',
      category: 'activity',
      kind,
      priority: 'low',
      petId: event.petId,
      petName,
      titleKey: `inbox.family.${event.eventType}`,
      titleParams: {
        actor: actorDisplayName,
        name: petName ?? '',
      },
      route: buildRoute(event),
      sortAt: event.createdAt,
      createdAt: event.createdAt,
      actorUserId: event.actorUserId,
      actorDisplayName,
    });
  }

  return items;
};
