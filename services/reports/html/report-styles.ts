import {
  OBSERVATION_CHIP_GAP,
  REPORT_BODY_PADDING_X,
  REPORT_BODY_PADDING_Y,
  REPORT_CONTENT_WIDTH,
  REPORT_FOOTER_HEIGHT,
  REPORT_HEADER_HEIGHT,
  REPORT_PAGE_HEIGHT,
  REPORT_PAGE_WIDTH,
} from './report-layout';

type ReportStylesParams = {
  primaryColor: string;
  /** When true, append screen-only styles for the in-app WebView preview. */
  forScreen?: boolean;
};

/** Vertical gap between pages when rendered on screen (not used for print). */
export const REPORT_SCREEN_PAGE_GAP = 14;

function buildScreenStyles(): string {
  return `
      html, body {
        background: #e7eae8;
      }
      .report-page {
        margin: 0 auto ${REPORT_SCREEN_PAGE_GAP}px;
        box-shadow: 0 6px 18px rgba(26, 31, 28, 0.12);
      }
      .report-page:last-child {
        margin-bottom: 0;
      }`;
}

export function buildReportStyles({ primaryColor, forScreen = false }: ReportStylesParams): string {
  const chipMinWidth = `calc((100% - ${OBSERVATION_CHIP_GAP * 7}px) / 8)`;

  const baseStyles = `
      @page {
        size: ${REPORT_PAGE_WIDTH}px ${REPORT_PAGE_HEIGHT}px;
        margin: 0;
      }
      * { box-sizing: border-box; }
      html, body {
        font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif;
        color: #1a1f1c;
        line-height: 1.3;
        margin: 0;
        padding: 0;
        background: #ffffff;
      }
      .report-page {
        position: relative;
        width: ${REPORT_PAGE_WIDTH}px;
        height: ${REPORT_PAGE_HEIGHT}px;
        page-break-after: always;
        break-after: page;
        overflow: hidden;
        background: #ffffff;
        margin: 0;
      }
      .report-page:last-child {
        page-break-after: auto;
        break-after: auto;
      }
      .report-header {
        position: absolute;
        top: 0;
        left: 0;
        width: ${REPORT_PAGE_WIDTH}px;
        height: ${REPORT_HEADER_HEIGHT}px;
        background: ${primaryColor};
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 6px 20px;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .report-header-brand {
        font-size: 20px;
        font-weight: 700;
        margin: 0;
        line-height: 1.1;
        letter-spacing: -0.02em;
      }
      .report-header-actions {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-shrink: 0;
      }
      .app-store-badge svg {
        width: 80px;
        height: 24px;
        display: block;
      }
      .report-qr {
        width: 44px;
        height: 44px;
        border-radius: 6px;
        background: #fff;
        flex-shrink: 0;
      }
      .report-qr-placeholder {
        background: rgba(255, 255, 255, 0.25);
      }
      .report-page-body {
        position: absolute;
        top: ${REPORT_HEADER_HEIGHT}px;
        bottom: ${REPORT_FOOTER_HEIGHT}px;
        left: 0;
        width: ${REPORT_PAGE_WIDTH}px;
        padding: ${REPORT_BODY_PADDING_Y}px ${REPORT_BODY_PADDING_X}px;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        align-items: stretch;
        justify-content: flex-start;
      }
      .report-footer {
        position: absolute;
        bottom: 0;
        left: 0;
        width: ${REPORT_PAGE_WIDTH}px;
        height: ${REPORT_FOOTER_HEIGHT}px;
        background: ${primaryColor};
        color: #fff;
        display: flex;
        align-items: center;
        padding: 0 20px;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .report-footer-left,
      .report-footer-center,
      .report-footer-right {
        flex: 1;
        font-size: 8px;
        color: #fff;
        line-height: 1.2;
      }
      .report-footer-left {
        text-align: left;
        font-weight: 700;
      }
      .report-footer-center {
        text-align: center;
      }
      .report-footer-right {
        text-align: right;
      }
      .pet-info-card {
        width: 100%;
        max-width: none;
        background: #f3f5f3;
        border: 1px solid #e4e8e4;
        border-radius: 10px;
        margin-bottom: 6px;
        padding: 10px 12px;
        box-shadow: 0 1px 2px rgba(26, 31, 28, 0.04);
        break-inside: avoid;
        page-break-inside: avoid;
      }
      .pet-info-header {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 8px;
        width: 100%;
      }
      .pet-photo {
        width: 52px;
        height: 52px;
        border-radius: 50%;
        object-fit: cover;
        border: 2px solid #fff;
        flex-shrink: 0;
        box-shadow: 0 1px 3px rgba(26, 31, 28, 0.08);
      }
      .pet-photo-placeholder {
        display: flex;
        align-items: center;
        justify-content: center;
        background: #e8ece8;
        font-size: 20px;
      }
      .pet-info-heading {
        flex: 1;
        min-width: 0;
      }
      .pet-name {
        font-size: 18px;
        font-weight: 700;
        margin: 0 0 2px;
        line-height: 1.15;
      }
      .pet-breed-line {
        color: #5c665e;
        margin: 0;
        font-size: 10px;
      }
      .pet-detail-grid {
        display: grid;
        grid-template-columns: repeat(5, minmax(0, 1fr));
        gap: 6px 8px;
        margin-bottom: 6px;
        width: 100%;
      }
      .pet-detail-label {
        font-size: 8px;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: #5c665e;
        line-height: 1.2;
      }
      .pet-detail-value {
        font-size: 10px;
        font-weight: 600;
        margin-top: 1px;
        line-height: 1.2;
        word-break: break-word;
      }
      .pet-info-footer {
        display: flex;
        flex-wrap: wrap;
        gap: 4px 24px;
        font-size: 9px;
        color: #5c665e;
        width: 100%;
      }
      .report-summary {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 6px 14px;
        width: 100%;
        margin-bottom: 8px;
        padding: 7px 12px;
        border: 1px solid #e4e8e4;
        border-radius: 8px;
        background: #fbfcfb;
        break-inside: avoid;
        page-break-inside: avoid;
      }
      .summary-title {
        font-size: 8px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: #8a948c;
      }
      .summary-items {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 5px 14px;
      }
      .summary-item {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        font-size: 9.5px;
        font-weight: 600;
        color: #1a1f1c;
        line-height: 1.2;
      }
      .summary-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #9aa39c;
        flex-shrink: 0;
      }
      .summary-normal { color: #1c7a33; }
      .summary-normal .summary-dot { background: #34c759; }
      .summary-alert { color: #b25000; }
      .summary-alert .summary-dot { background: #ff9500; }
      .section-heading {
        font-size: 13px;
        font-weight: 700;
        margin: 0 0 4px;
        line-height: 1.2;
        width: 100%;
      }
      .observations-section,
      .records-section {
        width: 100%;
        max-width: none;
        margin-bottom: 2px;
        flex-shrink: 0;
      }
      .observation-day,
      .records-day {
        width: 100%;
        margin-bottom: 5px;
        break-inside: avoid;
        page-break-inside: avoid;
      }
      .observation-day-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        margin: 0 0 3px;
        width: 100%;
      }
      .observation-day-title,
      .records-day-title {
        font-size: 10px;
        font-weight: 700;
        margin: 0 0 3px;
        color: #1a1f1c;
        width: 100%;
      }
      .observation-day-head .observation-day-title {
        margin: 0;
        width: auto;
      }
      .day-status {
        display: inline-flex;
        align-items: center;
        gap: 3px;
        font-size: 8px;
        font-weight: 700;
        line-height: 1;
        padding: 2px 6px;
        border-radius: 999px;
        white-space: nowrap;
        flex-shrink: 0;
      }
      .day-status-dot {
        width: 5px;
        height: 5px;
        border-radius: 50%;
      }
      .day-status-ok {
        color: #1c7a33;
        background: rgba(52, 199, 89, 0.14);
      }
      .day-status-ok .day-status-dot { background: #34c759; }
      .day-status-alert {
        color: #b25000;
        background: rgba(255, 149, 0, 0.16);
      }
      .day-status-alert .day-status-dot { background: #ff9500; }
      .observation-chips {
        display: flex;
        flex-wrap: wrap;
        gap: ${OBSERVATION_CHIP_GAP}px;
        width: 100%;
        max-width: none;
        justify-content: flex-start;
        align-items: stretch;
      }
      .observation-chip {
        flex: 1 1 0;
        min-width: ${chipMinWidth};
        max-width: 100%;
        border: 1px solid #e4e8e4;
        border-radius: 6px;
        padding: 4px 4px 6px;
        background: #fff;
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;
        position: relative;
        overflow: hidden;
        box-shadow: 0 1px 2px rgba(26, 31, 28, 0.03);
        break-inside: avoid;
        page-break-inside: avoid;
      }
      .chip-icon {
        font-size: 13px;
        line-height: 1;
      }
      .chip-label {
        font-size: 7.5px;
        color: #8a948c;
        line-height: 1.1;
        margin-top: 3px;
        width: 100%;
        overflow: hidden;
        display: -webkit-box;
        -webkit-line-clamp: 1;
        -webkit-box-orient: vertical;
        word-break: break-word;
        text-transform: uppercase;
        letter-spacing: 0.02em;
      }
      .chip-value {
        font-size: 8.5px;
        font-weight: 700;
        line-height: 1.15;
        margin-top: 2px;
        width: 100%;
        overflow: hidden;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        white-space: normal;
        word-break: break-word;
      }
      .chip-status-bar {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        height: 2px;
      }
      .chip-normal .chip-value { color: #248a3d; }
      .chip-normal .chip-status-bar { background: #34c759; }
      .chip-alert .chip-value { color: #d70015; }
      .chip-alert .chip-status-bar { background: #ff9500; }
      .observation-notes {
        font-size: 8px;
        color: #5c665e;
        margin: 3px 0 0;
        line-height: 1.25;
        word-break: break-word;
        width: 100%;
      }
      .records-timeline {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 5px;
      }
      .record-entry {
        display: flex;
        flex-direction: row;
        align-items: stretch;
        gap: 10px;
        width: 100%;
        max-width: none;
        break-inside: avoid;
        page-break-inside: avoid;
      }
      .record-time-col {
        width: 44px;
        flex-shrink: 0;
        font-size: 8px;
        font-weight: 600;
        color: #5c665e;
        line-height: 1.25;
        padding-top: 8px;
        text-align: left;
      }
      .record-card {
        flex: 1;
        min-width: 0;
        width: 100%;
        background: #f5f7f5;
        border: 1px solid #e4e8e4;
        border-radius: 8px;
        padding: 6px 10px;
        box-shadow: 0 1px 2px rgba(26, 31, 28, 0.04);
      }
      .record-title-row {
        display: flex;
        align-items: center;
        gap: 5px;
        margin-bottom: 2px;
        width: 100%;
      }
      .record-icon {
        font-size: 11px;
        line-height: 1;
        flex-shrink: 0;
      }
      .record-type {
        font-size: 9px;
        font-weight: 700;
        line-height: 1.25;
      }
      .record-detail {
        font-size: 8px;
        line-height: 1.3;
        word-break: break-word;
        width: 100%;
        color: #1a1f1c;
      }
      .record-notes {
        font-size: 8px;
        color: #5c665e;
        margin-top: 3px;
        line-height: 1.25;
        word-break: break-word;
        width: 100%;
      }
      .empty-message {
        color: #5c665e;
        font-style: italic;
        font-size: 10px;
        padding: 12px 0;
        text-align: center;
        width: 100%;
      }`;

  return forScreen ? `${baseStyles}\n${buildScreenStyles()}` : baseStyles;
}

export { REPORT_CONTENT_WIDTH };
