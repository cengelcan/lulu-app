import assert from 'node:assert/strict';
import test from 'node:test';

import { getScreenHorizontalPadding, LayoutTokens } from './layout';

test('screen padding gives compact phones more usable width', () => {
  assert.equal(getScreenHorizontalPadding(320), LayoutTokens.compactHorizontalPadding);
  assert.equal(getScreenHorizontalPadding(359), LayoutTokens.compactHorizontalPadding);
  assert.equal(getScreenHorizontalPadding(360), LayoutTokens.horizontalPadding);
  assert.equal(getScreenHorizontalPadding(1024), LayoutTokens.horizontalPadding);
});

test('responsive content widths preserve reading and dashboard hierarchy', () => {
  assert.ok(LayoutTokens.readingContentMaxWidth >= 600);
  assert.ok(LayoutTokens.dashboardContentMaxWidth > LayoutTokens.readingContentMaxWidth);
  assert.ok(LayoutTokens.regularWidthBreakpoint > LayoutTokens.compactWidthBreakpoint);
});
