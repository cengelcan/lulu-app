import { Platform } from 'react-native';
import {
  cacheDirectory,
  copyAsync,
  deleteAsync,
  downloadAsync,
  getInfoAsync,
  makeDirectoryAsync,
} from 'expo-file-system/legacy';

export type NotificationPhotoAttachment = {
  identifier: string;
  url: string;
};

const ATTACHMENT_CACHE_DIR = cacheDirectory ? `${cacheDirectory}notification-pet-photos/` : null;

function getFileExtension(uri: string): string {
  const lower = uri.toLowerCase().split('?')[0] ?? uri;

  if (lower.endsWith('.png')) {
    return 'png';
  }
  if (lower.endsWith('.gif')) {
    return 'gif';
  }

  return 'jpg';
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

function hashUri(uri: string): string {
  let hash = 0;
  for (let index = 0; index < uri.length; index += 1) {
    hash = (hash * 31 + uri.charCodeAt(index)) >>> 0;
  }

  return hash.toString(16);
}

function buildAttachmentUri(photoUri: string, attachmentKey: string): string | null {
  if (!ATTACHMENT_CACHE_DIR) {
    return null;
  }

  const safeKey = attachmentKey.replace(/[^a-zA-Z0-9_-]/g, '-');
  return `${ATTACHMENT_CACHE_DIR}${safeKey}-${hashUri(photoUri)}.${getFileExtension(photoUri)}`;
}

async function resolveLocalPhotoAttachment(
  photoUri: string,
  attachmentKey: string
): Promise<NotificationPhotoAttachment | null> {
  const fileUri = normalizeLocalFileUri(photoUri);
  const info = await getInfoAsync(fileUri);

  if (!info.exists) {
    return null;
  }

  const targetUri = buildAttachmentUri(photoUri, attachmentKey);
  if (!targetUri) {
    return null;
  }

  await makeDirectoryAsync(ATTACHMENT_CACHE_DIR!, { intermediates: true });
  await deleteAsync(targetUri, { idempotent: true });
  await copyAsync({ from: fileUri, to: targetUri });

  return {
    identifier: 'pet-photo',
    url: targetUri,
  };
}

async function resolveRemotePhotoAttachment(
  photoUri: string,
  attachmentKey: string
): Promise<NotificationPhotoAttachment | null> {
  const targetUri = buildAttachmentUri(photoUri, attachmentKey);
  if (!targetUri) {
    return null;
  }

  await makeDirectoryAsync(ATTACHMENT_CACHE_DIR!, { intermediates: true });
  await deleteAsync(targetUri, { idempotent: true });
  const result = await downloadAsync(photoUri, targetUri);
  if (result.status !== 200) {
    return null;
  }

  const downloaded = await getInfoAsync(targetUri);
  if (!downloaded.exists) {
    return null;
  }

  return {
    identifier: 'pet-photo',
    url: targetUri,
  };
}

export async function resolvePetPhotoAttachment(
  photoUri: string | null | undefined,
  attachmentKey: string
): Promise<NotificationPhotoAttachment | null> {
  if (Platform.OS === 'web' || !photoUri?.trim()) {
    return null;
  }

  const trimmed = photoUri.trim();

  try {
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return await resolveRemotePhotoAttachment(trimmed, attachmentKey);
    }

    return await resolveLocalPhotoAttachment(trimmed, attachmentKey);
  } catch {
    return null;
  }
}
