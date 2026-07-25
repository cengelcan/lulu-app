import { renderDailyObservationSection } from '@/services/reports/html/components/daily-observation-section';
import { renderReportFooter } from '@/services/reports/html/components/report-footer';
import {
  renderAppStoreBadgeHtml,
  renderReportHeader,
} from '@/services/reports/html/components/report-header';
import { renderPetInfoCard, renderPetPhotoHtml } from '@/services/reports/html/components/pet-info-card';
import { renderRecordsTimeline } from '@/services/reports/html/components/records-timeline';
import { renderReportSummary } from '@/services/reports/html/components/report-summary';
import {
  paginateVisitPrep,
  renderVisitPrepBody,
} from '@/services/reports/html/components/visit-prep';
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
import type { VisitBrief, VisitBriefDocumentLabels } from '@/types/vet-visit';
import type { ResolvedLanguage } from '@/types/language';
import { escapeHtml } from '@/utils/html';
import { REPORT_BRAND_COLOR } from '@/constants/branding';

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
  visitBrief?: VisitBrief | null;
  visitLabels?: VisitBriefDocumentLabels | null;
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
  primaryColor = REPORT_BRAND_COLOR,
  showAppStoreBadge = false,
  summary = null,
  visitBrief = null,
  visitLabels = null,
  mode = 'print',
}: GenerateReportHtmlParams): string {
  const petPhotoHtml = renderPetPhotoHtml(pet.name, photoDataUri);
  const appStoreBadgeHtml = renderAppStoreBadgeHtml(showAppStoreBadge, shellLabels);

  const hasSummary = Boolean(summary && summary.lines.length > 0);
  const hasVisitPrep = Boolean(visitBrief && visitLabels);
  const visitPages =
    visitBrief && visitLabels ? paginateVisitPrep(visitBrief) : [];
  const pages = paginateReportContent(content, {
    hasSummary,
    includePetCard: !hasVisitPrep,
  });
  const totalPages = visitPages.length + pages.length;

  let questionOffset = 0;
  const visitPagesHtml =
    visitBrief && visitLabels
      ? visitPages
          .map((page, pageIndex) => {
            const pageNumber = pageIndex + 1;
            const body = `
              ${
                page.includeOverview
                  ? renderPetInfoCard({
                      pet,
                      petPhotoHtml,
                      qrCodeDataUri,
                      labels,
                      qrCodeAlt: shellLabels.qrCodeAlt,
                    })
                  : ''
              }
              ${renderVisitPrepBody({
                brief: visitBrief,
                labels: visitLabels,
                page,
                questionOffset,
                formatDate,
              })}`;
            questionOffset += page.questions.length;

            return `
            <div class="report-page">
              <div class="report-sheet">
                ${renderReportHeader({ appStoreBadgeHtml })}
                <div class="report-page-body">${body}</div>
                ${renderReportFooter({
                  generatedAtLabel,
                  pageLabel: formatPageLabel(pageNumber, totalPages),
                })}
              </div>
            </div>`;
          })
          .join('')
      : '';

  const pagesHtml = pages
    .map((page, pageIndex) => {
      const pageNumber = visitPages.length + pageIndex + 1;

      const pageBody = page.showEmpty
        ? `<p class="empty-message">${escapeHtml(labels.empty)}</p>`
        : `
        ${
          page.includePetCard
            ? renderPetInfoCard({
                pet,
                petPhotoHtml,
                qrCodeDataUri,
                labels,
                qrCodeAlt: shellLabels.qrCodeAlt,
              })
            : ''
        }
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
          ${renderReportHeader({ appStoreBadgeHtml })}
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
    ${visitPagesHtml}
    ${pagesHtml}
  </body>
</html>`;
}
