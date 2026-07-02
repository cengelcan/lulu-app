import { File, Paths } from 'expo-file-system';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

import {
  REPORT_PDF_PAGE_HEIGHT_PT,
  REPORT_PDF_PAGE_WIDTH_PT,
} from './html/report-layout';

const DEFAULT_REPORT_FILE_NAME = 'report';

/**
 * Strips characters that are invalid in file names across iOS/Android/desktop
 * (the slash family plus reserved Windows characters) so the share sheet shows
 * a clean, human-readable name instead of failing or mangling the path.
 */
function sanitizeReportFileName(name: string): string {
  const cleaned = name
    .replace(/[/\\:*?"<>|\u0000-\u001f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return cleaned.length > 0 ? cleaned : DEFAULT_REPORT_FILE_NAME;
}

export async function exportReportPdf(html: string, fileName?: string): Promise<void> {
  const { uri } = await Print.printToFileAsync({
    html,
    width: REPORT_PDF_PAGE_WIDTH_PT,
    height: REPORT_PDF_PAGE_HEIGHT_PT,
  });

  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) {
    throw new Error('errors.shareUnavailable');
  }

  // expo-print writes to a random cache path, so the share sheet would otherwise
  // surface an opaque UUID. Copy the PDF to a named cache file and share that.
  let shareUri = uri;
  if (fileName) {
    const safeName = sanitizeReportFileName(fileName);
    const source = new File(uri);
    const destination = new File(Paths.cache, `${safeName}.pdf`);

    if (destination.exists) {
      destination.delete();
    }

    source.copy(destination);
    shareUri = destination.uri;
  }

  await Sharing.shareAsync(shareUri, {
    mimeType: 'application/pdf',
    UTI: 'com.adobe.pdf',
    dialogTitle: 'Share report',
  });
}
