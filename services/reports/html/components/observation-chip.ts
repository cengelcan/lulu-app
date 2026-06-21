import type { ReportCheckInFieldEntry } from '@/types/report';
import { escapeHtml } from '@/utils/html';

export function renderObservationChip(field: ReportCheckInFieldEntry): string {
  const statusClass = field.isNormal ? 'chip-normal' : 'chip-alert';

  return `
    <div class="observation-chip ${statusClass}">
      <div class="chip-icon">${escapeHtml(field.emoji)}</div>
      <div class="chip-label">${escapeHtml(field.label)}</div>
      <div class="chip-value">${escapeHtml(field.value)}</div>
      <div class="chip-status-bar"></div>
    </div>`;
}
