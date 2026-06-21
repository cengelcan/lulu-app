import { getRecordTypeEmoji } from '@/constants/record-type-emojis';
import type { ReportDocumentLabels, ReportRecordDayGroup } from '@/types/report';
import { escapeHtml } from '@/utils/html';

type RecordsTimelineParams = {
  recordGroups: ReportRecordDayGroup[];
  labels: ReportDocumentLabels;
  formatDate: (date: string) => string;
  includeHeading: boolean;
};

export function renderRecordsTimeline({
  recordGroups,
  labels,
  formatDate,
  includeHeading,
}: RecordsTimelineParams): string {
  if (recordGroups.length === 0) {
    return '';
  }

  return `
    <section class="records-section">
      ${includeHeading ? `<h2 class="section-heading">${escapeHtml(labels.recordsSection)}</h2>` : ''}
      ${recordGroups
        .map(
          (group) => `
        <div class="records-day">
          <h3 class="records-day-title">${escapeHtml(formatDate(group.date))}</h3>
          <div class="records-timeline">
            ${group.entries
              .map(
                (entry) => `
              <div class="record-entry">
                <div class="record-time-col">${escapeHtml(entry.time)}</div>
                <div class="record-card">
                  <div class="record-title-row">
                    <span class="record-icon">${escapeHtml(getRecordTypeEmoji(entry.typeId))}</span>
                    <strong class="record-type">${escapeHtml(entry.typeLabel)}</strong>
                  </div>
                  <div class="record-detail">${escapeHtml(entry.detail)}</div>
                  ${
                    entry.notes
                      ? `<div class="record-notes">${escapeHtml(labels.notes)}: ${escapeHtml(entry.notes)}</div>`
                      : ''
                  }
                </div>
              </div>`
              )
              .join('')}
          </div>
        </div>`
        )
        .join('')}
    </section>`;
}
