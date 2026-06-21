import { cacheDirectory, downloadAsync, readAsStringAsync } from 'expo-file-system/legacy';

import { getReportQrCodeUrl } from '@/constants/branding';

/** ~300 KB decoded — large photos can crash WKWebView during PDF render. */
const MAX_PHOTO_BASE64_LENGTH = 400_000;

function guessMimeType(uri: string): string {
  const lower = uri.toLowerCase();
  if (lower.endsWith('.png')) {
    return 'image/png';
  }
  if (lower.endsWith('.webp')) {
    return 'image/webp';
  }
  if (lower.endsWith('.gif')) {
    return 'image/gif';
  }

  return 'image/jpeg';
}

function normalizeLocalFileUri(uri: string): string {
  if (
    uri.startsWith('file://') ||
    uri.startsWith('content://') ||
    uri.startsWith('ph://') ||
    uri.startsWith('assets-library://')
  ) {
    return uri;
  }

  return `file://${uri}`;
}

export async function resolveReportPhotoDataUri(uri: string | null | undefined): Promise<string | null> {
  if (!uri?.trim()) {
    return null;
  }

  const trimmed = uri.trim();
  if (trimmed.startsWith('data:') || trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    if (trimmed.startsWith('data:') && trimmed.length > MAX_PHOTO_BASE64_LENGTH) {
      return null;
    }

    return trimmed;
  }

  try {
    const fileUri = normalizeLocalFileUri(trimmed);
    const base64 = await readAsStringAsync(fileUri, { encoding: 'base64' });

    if (!base64 || base64.length > MAX_PHOTO_BASE64_LENGTH) {
      return null;
    }

    return `data:${guessMimeType(trimmed)};base64,${base64}`;
  } catch {
    return null;
  }
}

export async function resolveQrCodeDataUri(): Promise<string | null> {
  if (!cacheDirectory) {
    return null;
  }

  try {
    const target = `${cacheDirectory}lulu-report-qr.png`;
    const result = await downloadAsync(getReportQrCodeUrl(undefined, 96), target);

    if (result.status !== 200) {
      return null;
    }

    const base64 = await readAsStringAsync(result.uri, { encoding: 'base64' });
    return `data:image/png;base64,${base64}`;
  } catch {
    return null;
  }
}

export type ReportExportAssets = {
  photoDataUri: string | null;
  qrCodeDataUri: string | null;
};

export async function resolveReportExportAssets(
  photoUri: string | null | undefined
): Promise<ReportExportAssets> {
  const [photoDataUri, qrCodeDataUri] = await Promise.all([
    resolveReportPhotoDataUri(photoUri),
    resolveQrCodeDataUri(),
  ]);

  return { photoDataUri, qrCodeDataUri };
}
