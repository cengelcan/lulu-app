import { REPORT_APP_NAME } from '@/constants/branding';
import { escapeHtml } from '@/utils/html';

type ReportHeaderParams = {
  qrCodeHtml: string;
  appStoreBadgeHtml?: string;
};

export function renderReportHeader({ qrCodeHtml, appStoreBadgeHtml = '' }: ReportHeaderParams): string {
  return `
    <header class="report-header">
      <p class="report-header-brand">${escapeHtml(REPORT_APP_NAME)}</p>
      <div class="report-header-actions">
        ${appStoreBadgeHtml}
        ${qrCodeHtml}
      </div>
    </header>`;
}

export function renderQrCodeHtml(qrCodeDataUri: string | null): string {
  if (qrCodeDataUri) {
    return `<img class="report-qr" src="${qrCodeDataUri}" alt="QR code" />`;
  }

  return `<div class="report-qr report-qr-placeholder" aria-hidden="true"></div>`;
}

export function renderAppStoreBadgeHtml(showAppStoreBadge: boolean): string {
  if (!showAppStoreBadge) {
    return '';
  }

  return `
    <div class="app-store-badge" aria-label="Download on the App Store">
      <svg viewBox="0 0 120 36" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">
        <rect width="120" height="36" rx="6" fill="#000" />
        <text x="38" y="12" fill="#fff" font-size="7" font-family="-apple-system, sans-serif">Download on the</text>
        <text x="38" y="26" fill="#fff" font-size="12" font-weight="700" font-family="-apple-system, sans-serif">App Store</text>
        <path d="M18 8c-.2 2.1 1.5 3.1 1.6 3.2-1.4 2-3.6 1.4-4.4 1.3-.9-.6-2.4-.6-3.9.6-2 1.5-1.6 4.4 1.4 6.8 1.9 1.6 4.4 2.7 5.8 1.1.9-1.1.6-2.7 1.3-3.4.7-.7 1.9-.5 2.4-.3.5.2 1.3.8 2 .8.7 0 1.1-.4 1.8-.4.7 0 1.2.4 2 .3 1-.1 1.7-.9 2.4-1.5-2.1-1.2-1.8-4.3.2-5.2-.9-1.1-2.3-1.2-2.8-1.2-.9 0-1.7.5-2.2.5z" fill="#fff"/>
      </svg>
    </div>`;
}
