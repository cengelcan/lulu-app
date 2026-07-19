import assert from 'node:assert/strict';
import test from 'node:test';

import { Colors } from './theme-colors';

function relativeLuminance(hex: string): number {
  const matches = hex.slice(1).match(/.{2}/g);
  if (!matches || matches.length !== 3) {
    throw new Error(`Expected a six-digit hex color, received ${hex}`);
  }

  const channels = matches
    .map((channel) => Number.parseInt(channel, 16) / 255)
    .map((channel) =>
      channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
    );

  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}

function contrastRatio(foreground: string, background: string): number {
  const foregroundLuminance = relativeLuminance(foreground);
  const backgroundLuminance = relativeLuminance(background);
  const lighter = Math.max(foregroundLuminance, backgroundLuminance);
  const darker = Math.min(foregroundLuminance, backgroundLuminance);

  return (lighter + 0.05) / (darker + 0.05);
}

test('semantic text and status colors meet WCAG AA contrast on the canvas', () => {
  for (const scheme of ['light', 'dark'] as const) {
    const colors = Colors[scheme];

    for (const role of ['text', 'textSecondary', 'accent', 'success', 'warning', 'alert'] as const) {
      const ratio = contrastRatio(colors[role], colors.background);
      assert.ok(ratio >= 4.5, `${scheme}.${role} contrast was ${ratio.toFixed(2)}:1`);
    }
  }
});

test('selected tab icons meet non-text contrast on the canvas', () => {
  for (const scheme of ['light', 'dark'] as const) {
    const colors = Colors[scheme];
    const ratio = contrastRatio(colors.tabIconSelected, colors.background);
    assert.ok(ratio >= 3, `${scheme}.tabIconSelected contrast was ${ratio.toFixed(2)}:1`);
  }
});
