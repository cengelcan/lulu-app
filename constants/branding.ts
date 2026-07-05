import { APP_STORE_LISTING_URL, SHARE_URL } from '@/constants/social';

export const REPORT_APP_NAME = 'Lulu';
export const REPORT_APP_URL = SHARE_URL;
export const REPORT_SITE_LABEL = 'lulu.com';
export const REPORT_SITE_URL = 'https://lulu.com';
export const REPORT_APP_STORE_URL = APP_STORE_LISTING_URL;

export function getReportQrCodeUrl(url: string = REPORT_APP_STORE_URL, size = 120): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}`;
}
