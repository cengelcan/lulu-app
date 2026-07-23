import type { ActivityEvent } from '@/types/sharing';

export function mergeFamilyActivityEvents(
  current: ActivityEvent[],
  incoming: ActivityEvent[]
): ActivityEvent[] {
  const byId = new Map(current.map((event) => [event.id, event]));
  for (const event of incoming) byId.set(event.id, event);
  return [...byId.values()].sort(
    (a, b) => b.occurredAt.localeCompare(a.occurredAt) || b.id.localeCompare(a.id)
  );
}

export function filterFamilyActivityEvents(
  events: ActivityEvent[],
  filters: { petId?: string | null; actorUserId?: string | null }
): ActivityEvent[] {
  return events.filter(
    (event) =>
      (!filters.petId || event.petId === filters.petId) &&
      (!filters.actorUserId || event.actorUserId === filters.actorUserId)
  );
}

export function isFamilyActivityUnread(
  event: ActivityEvent,
  lastReadAt: string | null
): boolean {
  return !lastReadAt || event.occurredAt > lastReadAt;
}
