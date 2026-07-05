import { Platform } from 'react-native';
import {
  cacheDirectory,
  downloadAsync,
  getInfoAsync,
  makeDirectoryAsync,
} from 'expo-file-system/legacy';

export type NotificationPhotoAttachment = {
  identifier: string;
  url: string;
  type: string;
};

const ATTACHMENT_CACHE_DIR = cacheDirectory ? `${cacheDirectory}notification-pet-photos/` : null;

function guessMimeType(uri: string): string {
  const lower = uri.toLowerCase().split('?')[0] ?? uri;

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

function cacheFileNameForRemoteUri(uri: string): string {
  const stripped = uri.split('?')[0] ?? uri;
  const extension = stripped.includes('.png')
    ? 'png'
    : stripped.includes('.webp')
      ? 'webp'
      : stripped.includes('.gif')
        ? 'gif'
        : 'jpg';

  let hash = 0;
  for (let index = 0; index < uri.length; index += 1) {
    hash = (hash * 31 + uri.charCodeAt(index)) >>> 0;
  }

  return `pet-${hash.toString(16)}.${extension}`;
}

async function resolveLocalPhotoAttachment(
  photoUri: string
): Promise<NotificationPhotoAttachment | null> {
  const fileUri = normalizeLocalFileUri(photoUri);
  const info = await getInfoAsync(fileUri);

  if (!info.exists) {
    return null;
  }

  return {
    identifier: 'pet-photo',
    url: fileUri,
    type: guessMimeType(fileUri),
  };
}

async function resolveRemotePhotoAttachment(
  photoUri: string
): Promise<NotificationPhotoAttachment | null> {
  if (!ATTACHMENT_CACHE_DIR) {
    return null;
  }

  await makeDirectoryAsync(ATTACHMENT_CACHE_DIR, { intermediates: true });

  const targetUri = `${ATTACHMENT_CACHE_DIR}${cacheFileNameForRemoteUri(photoUri)}`;
  const existing = await getInfoAsync(targetUri);

  if (!existing.exists) {
    const result = await downloadAsync(photoUri, targetUri);
    if (result.status !== 200) {
      return null;
    }
  }

  const downloaded = await getInfoAsync(targetUri);
  if (!downloaded.exists) {
    return null;
  }

  return {
    identifier: 'pet-photo',
    url: targetUri,
    type: guessMimeType(targetUri),
  };
}

export async function resolvePetPhotoAttachment(
  photoUri: string | null | undefined
): Promise<NotificationPhotoAttachment | null> {
  if (Platform.OS === 'web' || !photoUri?.trim()) {
    return null;
  }

  const trimmed = photoUri.trim();

  try {
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return await resolveRemotePhotoAttachment(trimmed);
    }

    return await resolveLocalPhotoAttachment(trimmed);
  } catch {
    return null;
  }
}
