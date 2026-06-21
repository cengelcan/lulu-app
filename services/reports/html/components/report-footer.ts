import { REPORT_APP_NAME, REPORT_SITE_LABEL } from '@/constants/branding';
import { escapeHtml } from '@/utils/html';

type ReportFooterParams = {
  generatedAtLabel: string;
  pageLabel: string;
};

export function renderReportFooter({ generatedAtLabel, pageLabel }: ReportFooterParams): string {
  const centerLabel = `${escapeHtml(generatedAtLabel)} · ${escapeHtml(pageLabel)}`;

  return `
    <footer class="report-footer">
      <span class="report-footer-left">${escapeHtml(REPORT_APP_NAME)}</span>
      <span class="report-footer-center">${centerLabel}</span>
      <span class="report-footer-right">${escapeHtml(REPORT_SITE_LABEL)}</span>
    </footer>`;
}
