import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

export async function exportReportPdf(html: string): Promise<void> {
  const { uri } = await Print.printToFileAsync({
    html,
    width: 612,
    height: 792,
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
