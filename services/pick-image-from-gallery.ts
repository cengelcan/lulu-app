import * as ImagePicker from 'expo-image-picker';

export type PickImageResult =
  | { ok: true; uri: string; base64: string | null; mimeType: string | null }
  | { ok: false; reason: 'permission_denied' | 'canceled' };

export async function pickImageFromGallery(): Promise<PickImageResult> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (!permission.granted) {
    return { ok: false, reason: 'permission_denied' };
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.7,
    base64: true,
  });

  if (result.canceled || result.assets.length === 0) {
    return { ok: false, reason: 'canceled' };
  }

  const asset = result.assets[0];

  return {
    ok: true,
    uri: asset.uri,
    base64: asset.base64 ?? null,
    mimeType: asset.mimeType ?? null,
  };
}
