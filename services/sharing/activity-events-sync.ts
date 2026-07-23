import { supabase } from '@/lib/supabase';
import type {
  ActivityEvent,
  ActivityEventCursor,
  ActivityEventPage,
  ActivityEventType,
} from '@/types/sharing';

export const ACTIVITY_EVENT_PAGE_SIZE = 30;

export type RemoteActivityEventRow = {
  id: string;
  family_id: string | null;
  pet_id: string;
  actor_user_id: string;
  event_type: ActivityEventType;
  entity_id: string | null;
  metadata: Record<string, unknown> | null;
  metadata_version: number | null;
  occurred_at: string | null;
  created_at: string;
};

export function fromRemoteActivityEventRow(row: RemoteActivityEventRow): ActivityEvent {
  return {
    id: row.id,
    familyId: row.family_id,
    petId: row.pet_id,
    actorUserId: row.actor_user_id,
    eventType: row.event_type,
    entityId: row.entity_id,
    metadata: row.metadata ?? {},
    metadataVersion: row.metadata_version ?? 1,
    occurredAt: row.occurred_at ?? row.created_at,
    createdAt: row.created_at,
  };
}

export async function fetchActivityEvents(petIds: string[]): Promise<ActivityEvent[]> {
  return (await fetchActivityEventPage(petIds, null, 50)).events;
}

export async function fetchActivityEventPage(
  petIds: string[],
  cursor: ActivityEventCursor | null = null,
  pageSize = ACTIVITY_EVENT_PAGE_SIZE
): Promise<ActivityEventPage> {
  if (petIds.length === 0) {
    return { events: [], nextCursor: null };
  }

  let query = supabase
    .from('activity_events')
    .select('*')
    .in('pet_id', petIds)
    .order('occurred_at', { ascending: false })
    .order('id', { ascending: false })
    .limit(pageSize + 1);

  if (cursor) {
    query = query.or(
      `occurred_at.lt.${cursor.occurredAt},and(occurred_at.eq.${cursor.occurredAt},id.lt.${cursor.id})`
    );
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  const rows = data as RemoteActivityEventRow[];
  const hasMore = rows.length > pageSize;
  const events = rows.slice(0, pageSize).map(fromRemoteActivityEventRow);
  const last = events.at(-1);

  return {
    events,
    nextCursor: hasMore && last ? { occurredAt: last.occurredAt, id: last.id } : null,
  };
}

export async function fetchActorDisplayNames(
  actorUserIds: string[]
): Promise<Map<string, string | null>> {
  if (actorUserIds.length === 0) {
    return new Map();
  }

  const uniqueIds = [...new Set(actorUserIds)];
  const { data, error } = await supabase
    .from('profiles')
    .select('id, display_name')
    .in('id', uniqueIds);

  if (error) {
    throw new Error(error.message);
  }

  return new Map(
    (data ?? []).map((profile) => [profile.id as string, profile.display_name as string | null])
  );
}
