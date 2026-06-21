import { getRecordTypeEmoji } from '@/constants/record-type-emojis';
import { REPORT_APP_NAME, REPORT_APP_URL } from '@/constants/branding';
import type { ReportDocumentLabels, ReportPetSummary, ReportPreviewContent } from '@/types/report';
import { escapeHtml } from '@/utils/html';

type GenerateReportHtmlParams = {
  pet: ReportPetSummary;
  content: ReportPreviewContent;
  labels: ReportDocumentLabels;
  formatDate: (date: string) => string;
  generatedAtLabel: string;
  footerPageLabel: string;
  photoDataUri?: string | null;
  qrCodeDataUri?: string | null;
  primaryColor?: string;
};

export function generateReportHtml({
  pet,
  content,
  labels,
  formatDate,
  generatedAtLabel,
  footerPageLabel,
  photoDataUri = null,
  qrCodeDataUri = null,
  primaryColor = '#6B8F71',
}: GenerateReportHtmlParams): string {
  const petPhotoHtml = photoDataUri
    ? `<img class="pet-avatar" src="${photoDataUri}" alt="${escapeHtml(pet.name)}" />`
    : `<div class="pet-avatar pet-avatar-placeholder">🐾</div>`;
  const qrCodeHtml = qrCodeDataUri
    ? `<img class="qr" src="${qrCodeDataUri}" alt="QR code" />`
    : `<div class="qr qr-placeholder"></div>`;

  const checkInHtml =
    content.checkIns.length === 0
      ? ''
      : `
    <section class="section">
      <h2 class="section-title">${escapeHtml(labels.dailyObservations)}</h2>
      ${content.checkIns
        .map(
          (day) => `
        <div class="day-block day-block-centered">
          <h3 class="day-title">${escapeHtml(formatDate(day.date))}</h3>
          <div class="metrics-row">
            ${day.fields
              .map(
                (field) => `
              <div class="metric-pill ${field.isNormal ? 'metric-normal' : 'metric-alert'}">
                <div class="metric-emoji">${escapeHtml(field.emoji)}</div>
                <div class="metric-label">${escapeHtml(field.label)}</div>
                <div class="metric-value">${escapeHtml(field.value)}</div>
              </div>`
              )
              .join('')}
          </div>
          ${
            day.notes
              ? `<p class="notes notes-centered"><strong>${escapeHtml(labels.notes)}:</strong> ${escapeHtml(day.notes)}</p>`
              : ''
          }
        </div>`
        )
        .join('')}
    </section>`;

  const recordsHtml =
    content.recordGroups.length === 0
      ? ''
      : `
    <section class="section">
      <h2 class="section-title">${escapeHtml(labels.recordsSection)}</h2>
      ${content.recordGroups
        .map(
          (group) => `
        <div class="day-block">
          <h3 class="record-day-title">${escapeHtml(formatDate(group.date))}</h3>
          ${group.entries
            .map(
              (entry) => `
            <div class="record-row">
              <div class="record-time">${escapeHtml(entry.time)}</div>
              <div class="record-body">
                <div class="record-type">
                  <span class="record-icon">${escapeHtml(getRecordTypeEmoji(entry.typeId))}</span>
                  <strong>${escapeHtml(entry.typeLabel)}</strong>
                </div>
                <div>${escapeHtml(entry.detail)}</div>
                ${
                  entry.notes
                    ? `<div class="notes">${escapeHtml(labels.notes)}: ${escapeHtml(entry.notes)}</div>`
                    : ''
                }
              </div>
            </div>`
            )
            .join('')}
        </div>`
        )
        .join('')}
    </section>`;

  const bodyContent = content.isEmpty
    ? `<p class="empty">${escapeHtml(labels.empty)}</p>`
    : `${checkInHtml}${recordsHtml}`;

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(REPORT_APP_NAME)} — ${escapeHtml(pet.name)}</title>
    <style>
      * { box-sizing: border-box; }
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        color: #1a1f1c;
        line-height: 1.45;
        margin: 0;
        background: #faf8f4;
      }
      .brand-header {
        background: ${primaryColor};
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 20px 24px;
      }
      .brand-name { font-size: 28px; font-weight: 700; margin: 0; }
      .brand-badge { font-size: 12px; opacity: 0.92; margin-top: 4px; }
      .qr { width: 72px; height: 72px; border-radius: 8px; background: #fff; }
      .qr-placeholder { background: rgba(255, 255, 255, 0.25); }
      .pet-card {
        background: #fff;
        border: 1px solid #e4e8e4;
        border-radius: 16px;
        margin: 16px;
        padding: 16px;
      }
      .pet-header {
        display: flex;
        align-items: center;
        gap: 16px;
        margin-bottom: 16px;
      }
      .pet-avatar {
        width: 72px;
        height: 72px;
        border-radius: 50%;
        object-fit: cover;
        border: 1px solid #e4e8e4;
        flex-shrink: 0;
      }
      .pet-avatar-placeholder {
        display: flex;
        align-items: center;
        justify-content: center;
        background: #f3f5f3;
        font-size: 28px;
      }
      .pet-header-text { flex: 1; min-width: 0; }
      .pet-title { font-size: 24px; margin: 0 0 4px; }
      .pet-subtitle { color: #5c665e; margin: 0; }
      .detail-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 12px;
        margin-bottom: 12px;
      }
      .detail-label {
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: #5c665e;
      }
      .detail-value { font-size: 12px; font-weight: 600; margin-top: 2px; }
      .pet-footer { font-size: 11px; color: #5c665e; }
      .section { padding: 0 16px 20px; }
      .section-title { font-size: 18px; margin: 0 0 12px; text-align: center; }
      h3 { font-size: 14px; margin: 0 0 8px; }
      .day-block { margin-bottom: 16px; page-break-inside: avoid; }
      .day-block-centered { text-align: center; }
      .day-title { text-align: center; }
      .record-day-title { text-align: left; }
      .metrics-row {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 8px;
        margin-bottom: 8px;
      }
      .metric-pill {
        border: 1px solid #e4e8e4;
        border-radius: 12px;
        padding: 8px 10px;
        width: 96px;
        text-align: center;
        background: #fff;
      }
      .metric-emoji { font-size: 18px; }
      .metric-label { font-size: 10px; color: #5c665e; }
      .metric-value { font-size: 11px; font-weight: 600; margin-top: 2px; }
      .metric-normal .metric-value { color: #34c759; }
      .metric-alert .metric-value { color: #ff3b30; }
      .record-row {
        display: flex;
        gap: 10px;
        margin-bottom: 8px;
        page-break-inside: avoid;
      }
      .record-time { width: 52px; font-size: 11px; color: #5c665e; }
      .record-body { flex: 1; font-size: 13px; }
      .record-type {
        display: flex;
        align-items: center;
        gap: 6px;
        margin-bottom: 2px;
      }
      .record-icon {
        font-size: 16px;
        line-height: 1;
      }
      .notes { font-size: 11px; color: #5c665e; margin-top: 4px; }
      .notes-centered { text-align: center; }
      .empty { color: #666; font-style: italic; padding: 24px 16px; }
      .report-footer {
        background: ${primaryColor};
        color: #fff;
        padding: 10px 16px;
        display: flex;
        justify-content: space-between;
        gap: 8px;
        flex-wrap: wrap;
        font-size: 10px;
      }
    </style>
  </head>
  <body>
    <header class="brand-header">
      <div>
        <p class="brand-name">${escapeHtml(REPORT_APP_NAME)}</p>
        <div class="brand-badge">${escapeHtml(labels.appStoreBadge)}</div>
      </div>
      ${qrCodeHtml}
    </header>

    <section class="pet-card">
      <div class="pet-header">
        ${petPhotoHtml}
        <div class="pet-header-text">
          <h1 class="pet-title">${escapeHtml(pet.name)}</h1>
          <p class="pet-subtitle">${escapeHtml(pet.speciesLabel)} · ${escapeHtml(pet.breedLabel)}</p>
        </div>
      </div>
      <div class="detail-grid">
        <div><div class="detail-label">${escapeHtml(labels.species)}</div><div class="detail-value">${escapeHtml(pet.speciesLabel)}</div></div>
        <div><div class="detail-label">${escapeHtml(labels.sex)}</div><div class="detail-value">${escapeHtml(pet.sexLabel)}</div></div>
        <div><div class="detail-label">${escapeHtml(labels.birthDate)}</div><div class="detail-value">${escapeHtml(pet.birthDateLabel)}</div></div>
        <div><div class="detail-label">${escapeHtml(labels.sterilization)}</div><div class="detail-value">${escapeHtml(pet.spayNeuterLabel)}</div></div>
        <div><div class="detail-label">${escapeHtml(labels.weight)}</div><div class="detail-value">${escapeHtml(pet.weightLabel)}</div></div>
      </div>
      <div class="pet-footer">
        <div>${escapeHtml(labels.owner)}: ${escapeHtml(pet.ownerName)}</div>
        <div>${escapeHtml(labels.microchip)}: ${escapeHtml(pet.microchipId)}</div>
      </div>
    </section>

    ${bodyContent}

    <footer class="report-footer">
      <span>${escapeHtml(REPORT_APP_NAME)}</span>
      <span>${escapeHtml(generatedAtLabel)}</span>
      <span>${escapeHtml(footerPageLabel)}</span>
      <span>${escapeHtml(REPORT_APP_URL.replace('https://', ''))}</span>
    </footer>
  </body>
</html>`;
}
