import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type {
  ReportCheckInEntry,
  ReportCheckInFieldEntry,
  ReportPreviewContent,
} from '@/types/report';

import { buildReportSummary } from './build-report-summary';
import { paginateReportContent } from './paginate-report-pages';

function makeField(overrides: Partial<ReportCheckInFieldEntry> = {}): ReportCheckInFieldEntry {
  return {
    key: 'eating',
    emoji: '🍽️',
    label: 'Eating',
    value: 'Normal',
    isNormal: true,
    ...overrides,
  } as ReportCheckInFieldEntry;
}

function makeDay(date: string, allNormal = true): ReportCheckInEntry {
  return {
    date,
    fields: [
      makeField({ key: 'eating' as ReportCheckInFieldEntry['key'] }),
      makeField({ key: 'drinking' as ReportCheckInFieldEntry['key'], isNormal: allNormal }),
    ],
    notes: null,
  };
}

function makeContent(days: ReportCheckInEntry[]): ReportPreviewContent {
  return {
    startDate: '2026-06-01',
    endDate: '2026-06-30',
    checkIns: days,
    recordGroups: [],
    isEmpty: days.length === 0,
  };
}

const t = (key: string, params?: Record<string, string | number>) =>
  params ? `${key}:${JSON.stringify(params)}` : key;

describe('paginateReportContent', () => {
  it('returns a single empty page when there is no data', () => {
    const pages = paginateReportContent(makeContent([]));
    assert.equal(pages.length, 1);
    assert.equal(pages[0].includePetCard, true);
    assert.equal(pages[0].showEmpty, true);
  });

  it('places the pet card and summary only on the first page', () => {
    const days = Array.from({ length: 40 }, (_, index) =>
      makeDay(`2026-06-${String((index % 28) + 1).padStart(2, '0')}`)
    );
    const pages = paginateReportContent(makeContent(days), { hasSummary: true });

    assert.ok(pages.length > 1, 'expected pagination across multiple pages');
    assert.equal(pages[0].includePetCard, true);
    assert.equal(pages[0].includeSummary, true);

    for (const page of pages.slice(1)) {
      assert.equal(page.includePetCard, false);
      assert.equal(page.includeSummary, false);
    }
  });

  it('shows the daily observations heading once', () => {
    const days = Array.from({ length: 40 }, (_, index) =>
      makeDay(`2026-06-${String((index % 28) + 1).padStart(2, '0')}`)
    );
    const pages = paginateReportContent(makeContent(days), { hasSummary: true });
    const headingCount = pages.filter((page) => page.showCheckInsHeading).length;
    assert.equal(headingCount, 1);
  });
});

describe('buildReportSummary', () => {
  it('returns no lines when there are no observations', () => {
    const summary = buildReportSummary({ content: makeContent([]), t });
    assert.equal(summary.lines.length, 0);
  });

  it('reports all-normal when every day is normal', () => {
    const summary = buildReportSummary({
      content: makeContent([makeDay('2026-06-01'), makeDay('2026-06-02')]),
      t,
    });
    assert.equal(summary.lines.length, 2);
    assert.equal(summary.lines[0].tone, 'neutral');
    assert.equal(summary.lines[1].tone, 'normal');
  });

  it('counts attention days when an observation is abnormal', () => {
    const summary = buildReportSummary({
      content: makeContent([makeDay('2026-06-01', false), makeDay('2026-06-02')]),
      t,
    });
    assert.equal(summary.lines[1].tone, 'alert');
    assert.match(summary.lines[1].text, /summaryAttentionDays/);
  });
});
