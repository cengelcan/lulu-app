import type { ReportDocumentLabels, ReportSummary } from '@/types/report';
import { escapeHtml } from '@/utils/html';

type ReportSummaryParams = {
  summary: ReportSummary;
  labels: ReportDocumentLabels;
};

export function renderReportSummary({ summary, labels }: ReportSummaryParams): string {
  if (summary.lines.length === 0) {
    return '';
  }

  const items = summary.lines
    .map(
      (line) => `
      <span class="summary-item summary-${line.tone}">
        <span class="summary-dot"></span>${escapeHtml(line.text)}
      </span>`
    )
    .join('');

  return `
    <section class="report-summary">
      <span class="summary-title">${escapeHtml(labels.summaryTitle)}</span>
      <div class="summary-items">${items}</div>
    </section>`;
}
