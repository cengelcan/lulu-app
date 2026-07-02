import { renderDailyObservationSection } from '@/services/reports/html/components/daily-observation-section';
import { renderReportFooter } from '@/services/reports/html/components/report-footer';
import {
  renderAppStoreBadgeHtml,
  renderQrCodeHtml,
  renderReportHeader,
} from '@/services/reports/html/components/report-header';
import { renderPetInfoCard, renderPetPhotoHtml } from '@/services/reports/html/components/pet-info-card';
import { renderRecordsTimeline } from '@/services/reports/html/components/records-timeline';
import { renderReportSummary } from '@/services/reports/html/components/report-summary';
import { REPORT_PAGE_WIDTH } from '@/services/reports/html/report-layout';
import { buildReportStyles } from '@/services/reports/html/report-styles';
import { paginateReportContent } from '@/services/reports/paginate-report-pages';
import type {
  ReportDocumentLabels,
  ReportPetSummary,
  ReportPreviewContent,
  ReportShellLabels,
  ReportSummary,
} from '@/types/report';
import type { ResolvedLanguage } from '@/types/language';
import { escapeHtml } from '@/utils/html';

type GenerateReportHtmlParams = {
  pet: ReportPetSummary;
  content: ReportPreviewContent;
  labels: ReportDocumentLabels;
  shellLabels: ReportShellLabels;
  language: ResolvedLanguage;
  formatDate: (date: string) => string;
  generatedAtLabel: string;
  formatPageLabel: (current: number, total: number) => string;
  photoDataUri?: string | null;
  qrCodeDataUri?: string | null;
  primaryColor?: string;
  showAppStoreBadge?: boolean;
  summary?: ReportSummary | null;
  /**
   * 'print' produces a paginated document for expo-print (PDF export).
   * 'screen' adds a viewport + screen styles so the exact same document can be
   * rendered inside a WebView as a true WYSIWYG preview.
   */
  mode?: 'print' | 'screen';
};

export function generateReportHtml({
  pet,
  content,
  labels,
  shellLabels,
  language,
  formatDate,
  generatedAtLabel,
  formatPageLabel,
  photoDataUri = null,
  qrCodeDataUri = null,
  primaryColor = '#6B8F71',
  showAppStoreBadge = false,
  summary = null,
  mode = 'print',
}: GenerateReportHtmlParams): string {
  const petPhotoHtml = renderPetPhotoHtml(pet.name, photoDataUri);
  const qrCodeHtml = renderQrCodeHtml(qrCodeDataUri, shellLabels.qrCodeAlt);
  const appStoreBadgeHtml = renderAppStoreBadgeHtml(showAppStoreBadge, shellLabels);

  const hasSummary = Boolean(summary && summary.lines.length > 0);
  const pages = paginateReportContent(content, { hasSummary });
  const totalPages = pages.length;

  const pagesHtml = pages
    .map((page, pageIndex) => {
      const pageNumber = pageIndex + 1;

      const pageBody = page.showEmpty
        ? `<p class="empty-message">${escapeHtml(labels.empty)}</p>`
        : `
        ${page.includePetCard ? renderPetInfoCard({ pet, petPhotoHtml, labels }) : ''}
        ${page.includeSummary && summary ? renderReportSummary({ summary, labels }) : ''}
        ${renderDailyObservationSection({
          checkIns: page.checkIns,
          labels,
          formatDate,
          includeHeading: page.showCheckInsHeading,
        })}
        ${renderRecordsTimeline({
          recordGroups: page.recordGroups,
          labels,
          formatDate,
          includeHeading: page.showRecordsHeading,
        })}
      `;

      return `
      <div class="report-page">
        <div class="report-sheet">
          ${renderReportHeader({ qrCodeHtml, appStoreBadgeHtml })}
          <div class="report-page-body">${pageBody}</div>
          ${renderReportFooter({
            generatedAtLabel,
            pageLabel: formatPageLabel(pageNumber, totalPages),
          })}
        </div>
      </div>`;
    })
    .join('');

  const viewportMeta =
    mode === 'screen'
      ? `<meta name="viewport" content="width=${REPORT_PAGE_WIDTH}, initial-scale=1, maximum-scale=1, user-scalable=no" />`
      : '';

  return `<!DOCTYPE html>
<html lang="${language}">
  <head>
    <meta charset="utf-8" />
    ${viewportMeta}
    <title>${escapeHtml(pet.name)} ${escapeHtml(shellLabels.pdfTitleSuffix)}</title>
    <style>${buildReportStyles({ primaryColor, forScreen: mode === 'screen' })}</style>
  </head>
  <body>
    ${pagesHtml}
  </body>
</html>`;
}
