import type { ReportCheckInEntry, ReportDocumentLabels } from '@/types/report';
import { escapeHtml } from '@/utils/html';

import { renderObservationChip } from './observation-chip';

type DailyObservationSectionParams = {
  checkIns: ReportCheckInEntry[];
  labels: ReportDocumentLabels;
  formatDate: (date: string) => string;
  includeHeading: boolean;
};

export function renderDailyObservationSection({
  checkIns,
  labels,
  formatDate,
  includeHeading,
}: DailyObservationSectionParams): string {
  if (checkIns.length === 0) {
    return '';
  }

  return `
    <section class="observations-section">
      ${includeHeading ? `<h2 class="section-heading">${escapeHtml(labels.dailyObservations)}</h2>` : ''}
      ${checkIns
        .map((day) => {
          const hasAlert = day.fields.some((field) => !field.isNormal);
          const statusClass = hasAlert ? 'day-status-alert' : 'day-status-ok';
          const statusLabel = hasAlert ? labels.dayStatusAlert : labels.dayStatusNormal;
          const statusHtml = day.fields.length
            ? `<span class="day-status ${statusClass}"><span class="day-status-dot"></span>${escapeHtml(statusLabel)}</span>`
            : '';

          return `
        <div class="observation-day">
          <div class="observation-day-head">
            <h3 class="observation-day-title">${escapeHtml(formatDate(day.date))}</h3>
            ${statusHtml}
          </div>
          <div class="observation-chips">
            ${day.fields.map((field) => renderObservationChip(field)).join('')}
          </div>
          ${
            day.notes
              ? `<p class="observation-notes"><strong>${escapeHtml(labels.notes)}:</strong> ${escapeHtml(day.notes)}</p>`
              : ''
          }
        </div>`;
        })
        .join('')}
    </section>`;
}
