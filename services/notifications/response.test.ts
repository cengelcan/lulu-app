import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { getCheckInNotificationData } from '@/services/notifications/constants';
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
      normalizeNotificationRoute('/check-in?date=2026-07-20'),
      '/check-in?date=2026-07-20'
    );
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
    assert.equal(
      getRouteFromNotificationResponse(buildResponse()),
      '/check-in?fromNotification=1'
    );
    assert.equal(
      getRouteFromNotificationResponse(buildResponse('/unknown')),
      '/check-in?fromNotification=1'
    );
  });

  it('marks an existing query route as notification-originated', () => {
    assert.equal(
      getRouteFromNotificationResponse(
        buildResponse('/reminders/rabies?id=reminder-1')
      ),
      '/reminders/rabies?id=reminder-1&fromNotification=1'
    );
  });

  it('returns null when there is no response', () => {
    assert.equal(getRouteFromNotificationResponse(null), null);
  });
});

describe('getCheckInNotificationData', () => {
  it('keeps the scheduled check-in date in both navigation targets', () => {
    assert.deepEqual(getCheckInNotificationData('2026-07-20'), {
      route: '/check-in?date=2026-07-20',
      deepLink: 'luluapp://check-in?date=2026-07-20',
    });
  });
});
