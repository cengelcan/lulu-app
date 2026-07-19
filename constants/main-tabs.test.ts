import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

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
