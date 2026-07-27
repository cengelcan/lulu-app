import assert from 'node:assert/strict';
import test from 'node:test';

import { buildReportStyles } from '@/services/reports/html/report-styles';

test('print report keeps an intentional white paper surface', () => {
  const styles = buildReportStyles({ primaryColor: '#625BEB' });

  assert.match(styles, /\.report-page[\s\S]*background: #ffffff;/);
  assert.doesNotMatch(styles, /#101010/);
});

test('screen report uses the app theme only around white paper pages', () => {
  const styles = buildReportStyles({
    primaryColor: '#625BEB',
    forScreen: true,
    screenBackgroundColor: '#101010',
  });

  assert.match(styles, /html, body \{[\s\S]*background: #101010;/);
  assert.match(styles, /\.report-page[\s\S]*background: #ffffff;/);
});
