import assert from 'node:assert/strict';
import test from 'node:test';

import {
  getAppearanceColorScheme,
  resolveThemeColorScheme,
} from '@/utils/theme-preference';

test('explicit theme preference overrides the system color scheme', () => {
  assert.equal(resolveThemeColorScheme('light', 'dark'), 'light');
  assert.equal(resolveThemeColorScheme('dark', 'light'), 'dark');
});

test('system preference follows the available system color scheme', () => {
  assert.equal(resolveThemeColorScheme('system', 'light'), 'light');
  assert.equal(resolveThemeColorScheme('system', 'dark'), 'dark');
  assert.equal(resolveThemeColorScheme('system', null), 'dark');
});

test('system preference clears the native appearance override', () => {
  assert.equal(getAppearanceColorScheme('system'), 'unspecified');
  assert.equal(getAppearanceColorScheme('light'), 'light');
  assert.equal(getAppearanceColorScheme('dark'), 'dark');
});
