import { getDatabase } from '@/storage/database';
import type { ActivityEvent } from '@/types/sharing';

type ActivityEventRow = {
  id: string;
  family_id: string | null;
  pet_id: string;
  actor_user_id: string;
  event_type: ActivityEvent['eventType'];
  entity_id: string | null;
  metadata: string;
  metadata_version: number;
  occurred_at: string;
  created_at: string;
};

function parseMetadata(value: string): Record<string, unknown> {
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function mapRow(row: ActivityEventRow): ActivityEvent {
  return {
    id: row.id,
    familyId: row.family_id,
    petId: row.pet_id,
    actorUserId: row.actor_user_id,
    eventType: row.event_type,
    entityId: row.entity_id,
    metadata: parseMetadata(row.metadata),
    metadataVersion: row.metadata_version,
    occurredAt: row.occurred_at,
    createdAt: row.created_at,
  };
}

export async function upsertActivityEvents(events: ActivityEvent[]): Promise<void> {
  if (events.length === 0) return;
  const db = await getDatabase();

  await db.withTransactionAsync(async () => {
    for (const event of events) {
      await db.runAsync(
        `INSERT INTO activity_events_cache (
          id, family_id, pet_id, actor_user_id, event_type, entity_id, metadata,
          metadata_version, occurred_at, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          family_id=excluded.family_id, pet_id=excluded.pet_id,
          actor_user_id=excluded.actor_user_id, event_type=excluded.event_type,
          entity_id=excluded.entity_id, metadata=excluded.metadata,
          metadata_version=excluded.metadata_version, occurred_at=excluded.occurred_at,
          created_at=excluded.created_at`,
        event.id, event.familyId ?? null, event.petId, event.actorUserId, event.eventType,
        event.entityId ?? null, JSON.stringify(event.metadata), event.metadataVersion,
        event.occurredAt, event.createdAt
      );
    }
  });
}

export async function getCachedActivityEvents(limit = 100): Promise<ActivityEvent[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<ActivityEventRow>(
    `SELECT * FROM activity_events_cache
     ORDER BY occurred_at DESC, id DESC LIMIT ?`,
    limit
  );
  return rows.map(mapRow);
}

export async function deleteActivityEventsOutsidePets(petIds: string[]): Promise<void> {
  const db = await getDatabase();
  if (petIds.length === 0) {
    await db.execAsync('DELETE FROM activity_events_cache;');
    return;
  }
  const placeholders = petIds.map(() => '?').join(', ');
  await db.runAsync(
    `DELETE FROM activity_events_cache WHERE pet_id NOT IN (${placeholders})`,
    ...petIds
  );
}

export async function deleteAllActivityEvents(): Promise<void> {
  const db = await getDatabase();
  await db.execAsync('DELETE FROM activity_events_cache;');
}
