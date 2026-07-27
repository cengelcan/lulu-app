import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { CARE_TOOLS } from '@/constants/care-tools';
import { MAIN_TABS } from '@/constants/main-tabs';

describe('MAIN_TABS', () => {
  it('keeps the VoiceOver and visual order aligned with the care journey', () => {
    assert.deepEqual(
      MAIN_TABS.map((tab) => tab.name),
      ['home', 'care', 'my-pets', 'profile']
    );
  });

  it('keeps every visible tab label and icon explicit', () => {
    assert.equal(new Set(MAIN_TABS.map((tab) => tab.labelKey)).size, MAIN_TABS.length);
    assert.equal(MAIN_TABS.every((tab) => Boolean(tab.icon)), true);
  });
});

describe('CARE_TOOLS', () => {
  it('preserves the agreed care-journey and VoiceOver order', () => {
    assert.deepEqual(
      CARE_TOOLS.map((tool) => tool.id),
      ['check_in', 'medications', 'reminders', 'vet_visits', 'health_records']
    );
  });

  it('exposes one unique destination per tool', () => {
    assert.equal(new Set(CARE_TOOLS.map((tool) => tool.route)).size, CARE_TOOLS.length);
    assert.equal(CARE_TOOLS.every((tool) => Boolean(tool.icon)), true);
  });
});
