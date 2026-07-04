import { Share } from 'react-native';

export type CopyTextResult = 'clipboard' | 'share';

/**
 * Copies text to the clipboard when the native module is available in the dev
 * build. Falls back to the system share sheet so older dev clients keep working
 * until the next native rebuild.
 */
export async function copyTextToClipboard(text: string): Promise<CopyTextResult> {
  try {
    const Clipboard = await import('expo-clipboard');
    await Clipboard.setStringAsync(text);
    return 'clipboard';
  } catch {
    await Share.share({ message: text });
    return 'share';
  }
}
