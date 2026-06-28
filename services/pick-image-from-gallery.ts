import { readAsStringAsync } from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';

export type PickImageResult =
  | { ok: true; uri: string; base64: string | null; mimeType: string | null }
  | { ok: false; reason: 'permission_denied' | 'canceled' };

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

function guessMimeType(uri: string, mimeType: string | null | undefined): string | null {
  if (mimeType) {
    return mimeType;
  }

  const lower = uri.toLowerCase();

  if (lower.endsWith('.png')) {
    return 'image/png';
  }

  if (lower.endsWith('.webp')) {
    return 'image/webp';
  }

  if (lower.endsWith('.heic') || lower.endsWith('.heif')) {
    return 'image/heic';
  }

  return 'image/jpeg';
}

async function resolveBase64(
  uri: string,
  base64: string | null | undefined
): Promise<string | null> {
  if (base64) {
    return base64;
  }

  try {
    return await readAsStringAsync(normalizeLocalFileUri(uri), { encoding: 'base64' });
  } catch {
    return null;
  }
}

function isImagePickerErrorResult(
  result: ImagePicker.ImagePickerResult | ImagePicker.ImagePickerErrorResult
): result is ImagePicker.ImagePickerErrorResult {
  return 'code' in result;
}

async function resolvePickerResult(): Promise<ImagePicker.ImagePickerResult> {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.7,
    base64: true,
    // iOS 17+ defaults to `.current`, which can return HEIC without base64 data.
    // Compatible transcodes to JPEG so uploads and previews work reliably.
    preferredAssetRepresentationMode:
      ImagePicker.UIImagePickerPreferredAssetRepresentationMode.Compatible,
  });

  if (!result.canceled && result.assets.length > 0) {
    return result;
  }

  if (Platform.OS !== 'android') {
    return result;
  }

  const pending = await ImagePicker.getPendingResultAsync();

  if (!pending || isImagePickerErrorResult(pending) || pending.canceled || !pending.assets?.length) {
    return result;
  }

  return pending;
}

export async function pickImageFromGallery(): Promise<PickImageResult> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (!permission.granted) {
    return { ok: false, reason: 'permission_denied' };
  }

  const result = await resolvePickerResult();

  if (result.canceled || result.assets.length === 0) {
    return { ok: false, reason: 'canceled' };
  }

  const asset = result.assets[0];
  const base64 = await resolveBase64(asset.uri, asset.base64 ?? null);
  const mimeType = guessMimeType(asset.uri, asset.mimeType);

  return {
    ok: true,
    uri: asset.uri,
    base64,
    mimeType,
  };
}
