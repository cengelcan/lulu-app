import assert from 'node:assert/strict';
import test from 'node:test';

import { Palette } from '../constants/theme-colors';
import { getContrastRatio, getReadableForegroundColor } from './color-contrast';

const AVATAR_COLORS = [
  Palette.badgePink,
  '#60A5FA',
  Palette.badgeEmerald,
  '#7C3AED',
  Palette.badgeOrange,
];

test('chooses the higher-contrast text color for light and dark backgrounds', () => {
  assert.equal(getReadableForegroundColor('#60A5FA'), Palette.ink);
  assert.equal(getReadableForegroundColor('#111111'), Palette.onDark);
});

test('family avatar foregrounds meet WCAG AA normal-text contrast', () => {
  for (const backgroundColor of AVATAR_COLORS) {
    const foregroundColor = getReadableForegroundColor(backgroundColor);
    const contrast = getContrastRatio(backgroundColor, foregroundColor);

    assert.ok(contrast !== null && contrast >= 4.5, `${backgroundColor} contrast was ${contrast}`);
  }
});

test('invalid colors fail safely to the dark foreground', () => {
  assert.equal(getReadableForegroundColor('transparent'), Palette.ink);
});
