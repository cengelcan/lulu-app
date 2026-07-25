import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  paginateVisitPrep,
  renderVisitPrepBody,
} from '@/services/reports/html/components/visit-prep';
import type { VisitBrief, VisitBriefDocumentLabels } from '@/types/vet-visit';

const labels: VisitBriefDocumentLabels = {
  sectionTitle: 'Visit preparation',
  reason: 'Reason',
  highlights: 'Highlights',
  questions: 'Questions',
  disclaimer: 'Not medical advice.',
  sourceReferences: 'Source records: {{sources}}',
};

const brief: VisitBrief = {
  range: { preset: '30d', startDate: '2026-07-01', endDate: '2026-07-30' },
  reason: 'Appetite changed',
  items: [
    {
      id: 'attention',
      tone: 'alert',
      text: 'Two days need attention',
      sourceIds: ['check-in:1'],
    },
  ],
  questions: Array.from({ length: 18 }, (_, index) => `Question ${index + 1}`),
  sources: [
    {
      id: 'check-in:1',
      kind: 'checkIn',
      date: '2026-07-20',
      label: 'Check-in',
      route: '/check-in?date=2026-07-20',
    },
  ],
  isEmpty: false,
};

describe('visit prep report pages', () => {
  it('keeps the overview first and safely chunks long question lists', () => {
    const pages = paginateVisitPrep(brief);

    assert.equal(pages.length, 3);
    assert.equal(pages[0].includeOverview, true);
    assert.equal(pages[0].questions.length, 6);
    assert.equal(pages[1].includeOverview, false);
    assert.equal(pages[2].includeDisclaimer, true);
  });

  it('renders human-readable source references and escapes user copy', () => {
    const html = renderVisitPrepBody({
      brief: { ...brief, reason: '<Main concern>' },
      labels,
      page: paginateVisitPrep(brief)[0],
      questionOffset: 0,
      formatDate: (date) => date,
    });

    assert.match(html, /Source records: Check-in - 2026-07-20/);
    assert.match(html, /&lt;Main concern&gt;/);
    assert.doesNotMatch(html, /<Main concern>/);
  });
});
