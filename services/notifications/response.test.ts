import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  getRouteFromNotificationResponse,
  normalizeNotificationRoute,
} from '@/services/notifications/response-route';

function buildResponse(route?: unknown) {
  return {
    notification: {
      request: {
        content: {
          data: route === undefined ? {} : { route },
        },
      },
    },
  };
}

describe('normalizeNotificationRoute', () => {
  it('preserves current check-in, reminder and record targets', () => {
    assert.equal(normalizeNotificationRoute('/check-in'), '/check-in');
    assert.equal(
      normalizeNotificationRoute('/reminders/rabies?id=reminder-1'),
      '/reminders/rabies?id=reminder-1'
    );
    assert.equal(normalizeNotificationRoute('/records/weight?id=record-1'), '/records/weight?id=record-1');
  });

  it('maps the legacy family entry to the hidden management route', () => {
    assert.equal(normalizeNotificationRoute('/family-sharing'), '/(tabs)/family');
  });

  it('rejects unknown, external and traversal targets', () => {
    assert.equal(normalizeNotificationRoute('/unknown'), null);
    assert.equal(normalizeNotificationRoute('https://example.com'), null);
    assert.equal(normalizeNotificationRoute('//example.com'), null);
    assert.equal(normalizeNotificationRoute('/records/../profile'), null);
  });
});

describe('getRouteFromNotificationResponse', () => {
  it('falls back to check-in when notification data has no safe route', () => {
    assert.equal(getRouteFromNotificationResponse(buildResponse()), '/check-in');
    assert.equal(getRouteFromNotificationResponse(buildResponse('/unknown')), '/check-in');
  });

  it('returns null when there is no response', () => {
    assert.equal(getRouteFromNotificationResponse(null), null);
  });
});
