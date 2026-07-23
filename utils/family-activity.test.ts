import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { ActivityEvent } from '@/types/sharing';
import { formatActivityRelativeTime } from '@/utils/activity-relative-time';
import {
  filterFamilyActivityEvents,
  isFamilyActivityUnread,
  mergeFamilyActivityEvents,
} from '@/utils/family-activity';

function event(
  id: string,
  occurredAt: string,
  overrides: Partial<ActivityEvent> = {}
): ActivityEvent {
  return {
    id,
    petId: 'pet-1',
    actorUserId: 'actor-1',
    eventType: 'dose_taken',
    entityId: 'dose-1',
    metadata: {},
    metadataVersion: 1,
    occurredAt,
    createdAt: occurredAt,
    ...overrides,
  };
}

describe('family activity timeline', () => {
  it('merges realtime and paginated events once in reverse chronological order', () => {
    const older = event('older', '2026-07-20T08:00:00.000Z');
    const newer = event('newer', '2026-07-21T08:00:00.000Z');
    const updatedOlder = { ...older, metadataVersion: 2 };
    const merged = mergeFamilyActivityEvents([older], [newer, updatedOlder]);

    assert.deepEqual(merged.map((item) => item.id), ['newer', 'older']);
    assert.equal(merged[1]?.metadataVersion, 2);
  });

  it('filters independently by pet and actor', () => {
    const events = [
      event('one', '2026-07-21T08:00:00.000Z'),
      event('two', '2026-07-21T09:00:00.000Z', {
        petId: 'pet-2',
        actorUserId: 'actor-2',
      }),
    ];

    assert.deepEqual(
      filterFamilyActivityEvents(events, { petId: 'pet-2' }).map((item) => item.id),
      ['two']
    );
    assert.deepEqual(
      filterFamilyActivityEvents(events, { actorUserId: 'actor-1' }).map((item) => item.id),
      ['one']
    );
  });

  it('formats timeline timestamps relative to the reference time', () => {
    const referenceDate = new Date('2026-07-23T10:00:00.000Z');

    assert.equal(
      formatActivityRelativeTime('2026-07-23T09:30:00.000Z', 'en', referenceDate),
      '30 minutes ago'
    );
    assert.equal(
      formatActivityRelativeTime('2026-07-23T09:30:00.000Z', 'de-DE', referenceDate),
      'vor 30 Minuten'
    );
    assert.equal(
      formatActivityRelativeTime('2026-07-23T09:30:00.000Z', 'tr-TR', referenceDate),
      '30 dakika önce'
    );
    assert.equal(
      formatActivityRelativeTime('2026-07-23T11:00:00.000Z', 'tr', referenceDate),
      '1 saat sonra'
    );
  });

  it('marks only activity after the stored read cursor as unread', () => {
    const item = event('new', '2026-07-23T10:00:00.000Z');
    assert.equal(isFamilyActivityUnread(item, '2026-07-23T09:59:59.000Z'), true);
    assert.equal(isFamilyActivityUnread(item, '2026-07-23T10:00:00.000Z'), false);
  });
});
