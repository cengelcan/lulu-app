import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { resolveStoredNotificationPermission } from '@/services/notifications/permission-status';

describe('resolveStoredNotificationPermission', () => {
  it('stores allowed when the OS grants permission', () => {
    assert.equal(resolveStoredNotificationPermission('allowed', true), 'allowed');
  });

  it('stores denied when the OS denies permission', () => {
    assert.equal(resolveStoredNotificationPermission('allowed', false), 'denied');
  });

  it('stores later without consulting the OS', () => {
    assert.equal(resolveStoredNotificationPermission('later', false), 'later');
  });

  it('passes through denied when set explicitly', () => {
    assert.equal(resolveStoredNotificationPermission('denied', true), 'denied');
  });
});
