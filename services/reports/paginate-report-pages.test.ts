import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type {
  ReportCheckInEntry,
  ReportCheckInFieldEntry,
  ReportPreviewContent,
} from '@/types/report';

import { buildReportSummary } from './build-report-summary';
import {
  PX_PER_PT,
  REPORT_PAGE_HEIGHT,
  REPORT_PAGE_WIDTH,
  REPORT_PDF_PAGE_HEIGHT_PT,
  REPORT_PDF_PAGE_WIDTH_PT,
} from './html/report-layout';
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

describe('report page geometry', () => {
  it('keeps the CSS page box aligned with the physical PDF sheet', () => {
    // The fixed-height `.report-page` box (CSS px @96 PPI) must fill the PDF
    // sheet (points @72 PPI). If this drifts, every printed page gets an empty
    // band at the bottom and right.
    assert.equal(REPORT_PAGE_WIDTH, Math.round(REPORT_PDF_PAGE_WIDTH_PT * PX_PER_PT));
    assert.equal(REPORT_PAGE_HEIGHT, Math.round(REPORT_PDF_PAGE_HEIGHT_PT * PX_PER_PT));
  });

  it('preserves the US Letter aspect ratio between px and pt', () => {
    const pxRatio = REPORT_PAGE_WIDTH / REPORT_PAGE_HEIGHT;
    const ptRatio = REPORT_PDF_PAGE_WIDTH_PT / REPORT_PDF_PAGE_HEIGHT_PT;
    assert.ok(Math.abs(pxRatio - ptRatio) < 0.005, 'page aspect ratio drifted');
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
