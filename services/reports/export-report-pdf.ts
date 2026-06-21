import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

export async function exportReportPdf(html: string): Promise<void> {
  const { uri } = await Print.printToFileAsync({ html });

  if (!(await Sharing.isAvailableAsync())) {
    throw new Error('Sharing is not available on this device');
  }

  await Sharing.shareAsync(uri, {
    mimeType: 'application/pdf',
    UTI: 'com.adobe.pdf',
    dialogTitle: 'Share report',
  });
}
