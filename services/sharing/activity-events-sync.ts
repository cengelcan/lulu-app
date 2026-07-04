import { supabase } from '@/lib/supabase';
import type { ActivityEvent, ActivityEventType } from '@/types/sharing';

type RemoteActivityEventRow = {
  id: string;
  pet_id: string;
  actor_user_id: string;
  event_type: ActivityEventType;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

function fromRemoteRow(row: RemoteActivityEventRow): ActivityEvent {
  return {
    id: row.id,
    petId: row.pet_id,
    actorUserId: row.actor_user_id,
    eventType: row.event_type,
    metadata: row.metadata ?? {},
    createdAt: row.created_at,
  };
}

export async function fetchActivityEvents(petIds: string[]): Promise<ActivityEvent[]> {
  if (petIds.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from('activity_events')
    .select('*')
    .in('pet_id', petIds)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    throw new Error(error.message);
  }

  return (data as RemoteActivityEventRow[]).map(fromRemoteRow);
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
