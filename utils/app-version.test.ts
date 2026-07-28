import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  compareAppVersions,
  resolveAppUpdateDecision,
  shouldShowOptionalUpdate,
} from '@/utils/app-version';

const policy = {
  enabled: true,
  latestVersion: '1.4.0',
  minimumSupportedVersion: '1.2.0',
  storeUrl: 'https://apps.apple.com/app/id6787669539',
  reminderIntervalHours: 24,
};

describe('app version comparison', () => {
  it('compares numeric version parts without lexicographic mistakes', () => {
    assert.equal(compareAppVersions('1.10.0', '1.9.0'), 1);
    assert.equal(compareAppVersions('1.3', '1.3.0'), 0);
    assert.equal(compareAppVersions('v1.2.1', '1.3.0'), -1);
    assert.equal(compareAppVersions('invalid', '1.3.0'), null);
  });
});

describe('app update policy', () => {
  it('offers an optional update to supported older versions', () => {
    assert.equal(resolveAppUpdateDecision('1.3.0', policy)?.kind, 'optional');
  });

  it('requires an update below the remotely supported minimum', () => {
    assert.equal(resolveAppUpdateDecision('1.1.0', policy)?.kind, 'required');
  });

  it('does not prompt TestFlight or current builds newer than the store version', () => {
    assert.equal(resolveAppUpdateDecision('1.4.0', policy), null);
    assert.equal(resolveAppUpdateDecision('1.5.0', policy), null);
  });

  it('fails open for invalid or prematurely configured policies', () => {
    assert.equal(
      resolveAppUpdateDecision('1.3.0', {
        ...policy,
        minimumSupportedVersion: '1.5.0',
      }),
      null
    );
    assert.equal(resolveAppUpdateDecision('1.3.0', { ...policy, enabled: false }), null);
  });
});

describe('optional update reminders', () => {
  it('reminds again only after the configured interval or a new release', () => {
    const now = Date.UTC(2026, 6, 28, 10);
    const dismissal = { version: '1.4.0', dismissedAt: now };

    assert.equal(
      shouldShowOptionalUpdate('1.4.0', dismissal, 24, now + 23 * 60 * 60 * 1000),
      false
    );
    assert.equal(
      shouldShowOptionalUpdate('1.4.0', dismissal, 24, now + 24 * 60 * 60 * 1000),
      true
    );
    assert.equal(shouldShowOptionalUpdate('1.5.0', dismissal, 24, now), true);
  });
});
