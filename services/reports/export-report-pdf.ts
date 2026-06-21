import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

import {
  REPORT_PDF_PAGE_HEIGHT_PT,
  REPORT_PDF_PAGE_WIDTH_PT,
} from './html/report-layout';

export async function exportReportPdf(html: string): Promise<void> {
  const { uri } = await Print.printToFileAsync({
    html,
    width: REPORT_PDF_PAGE_WIDTH_PT,
    height: REPORT_PDF_PAGE_HEIGHT_PT,
  });

  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) {
    throw new Error('Sharing is not available on this device');
  }

  await Sharing.shareAsync(uri, {
    mimeType: 'application/pdf',
    UTI: 'com.adobe.pdf',
    dialogTitle: 'Share report',
  });
}
