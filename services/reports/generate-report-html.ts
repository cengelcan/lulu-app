import type { ReportPetSummary, ReportPreviewContent } from '@/types/report';
import { escapeHtml } from '@/utils/html';

type GenerateReportHtmlParams = {
  pet: ReportPetSummary;
  content: ReportPreviewContent;
  labels: {
    title: string;
    generatedFor: string;
    dateRange: string;
    species: string;
    breed: string;
    ageGroup: string;
    checkInsSection: string;
    recordsSection: string;
    notes: string;
    empty: string;
  };
  formatDate: (date: string) => string;
};

export function generateReportHtml({
  pet,
  content,
  labels,
  formatDate,
}: GenerateReportHtmlParams): string {
  const rangeLabel = `${formatDate(content.startDate)} – ${formatDate(content.endDate)}`;

  const checkInHtml =
    content.checkIns.length === 0
      ? ''
      : `
    <section>
      <h2>${escapeHtml(labels.checkInsSection)}</h2>
      ${content.checkIns
        .map(
          (entry) => `
        <article class="entry">
          <h3>${escapeHtml(formatDate(entry.date))}</h3>
          ${
            entry.fields.length > 0
              ? `<ul>${entry.fields
                  .map(
                    (field) =>
                      `<li><strong>${escapeHtml(field.label)}:</strong> ${escapeHtml(field.value)}</li>`
                  )
                  .join('')}</ul>`
              : ''
          }
          ${
            entry.notes
              ? `<p class="notes"><strong>${escapeHtml(labels.notes)}:</strong> ${escapeHtml(entry.notes)}</p>`
              : ''
          }
        </article>`
        )
        .join('')}
    </section>`;

  const recordsHtml =
    content.records.length === 0
      ? ''
      : `
    <section>
      <h2>${escapeHtml(labels.recordsSection)}</h2>
      ${content.records
        .map(
          (entry) => `
        <article class="entry">
          <h3>${escapeHtml(formatDate(entry.date))} · ${escapeHtml(entry.typeLabel)}</h3>
          <p>${escapeHtml(entry.detail)}</p>
          ${
            entry.notes
              ? `<p class="notes"><strong>${escapeHtml(labels.notes)}:</strong> ${escapeHtml(entry.notes)}</p>`
              : ''
          }
        </article>`
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
    <title>${escapeHtml(labels.title)}</title>
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        color: #1a1a1a;
        line-height: 1.5;
        margin: 32px;
      }
      h1 { font-size: 24px; margin: 0 0 8px; }
      h2 {
        font-size: 16px;
        margin: 24px 0 12px;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: #555;
      }
      h3 { font-size: 15px; margin: 0 0 8px; }
      .meta { color: #555; margin: 0 0 4px; }
      .entry {
        border: 1px solid #e5e5e5;
        border-radius: 12px;
        padding: 12px 14px;
        margin-bottom: 10px;
      }
      ul { margin: 0; padding-left: 18px; }
      li { margin-bottom: 4px; }
      .notes { margin: 8px 0 0; color: #333; }
      .empty { color: #666; font-style: italic; }
    </style>
  </head>
  <body>
    <header>
      <h1>${escapeHtml(labels.title)}</h1>
      <p class="meta">${escapeHtml(labels.generatedFor)} ${escapeHtml(pet.name)}</p>
      <p class="meta">${escapeHtml(labels.species)}: ${escapeHtml(pet.species)}</p>
      <p class="meta">${escapeHtml(labels.breed)}: ${escapeHtml(pet.breed)}</p>
      <p class="meta">${escapeHtml(labels.ageGroup)}: ${escapeHtml(pet.ageGroup)}</p>
      <p class="meta">${escapeHtml(labels.dateRange)}: ${escapeHtml(rangeLabel)}</p>
    </header>
    ${bodyContent}
  </body>
</html>`;
}
