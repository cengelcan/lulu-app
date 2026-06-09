import * as ImagePicker from 'expo-image-picker';

export type PickPetPhotoResult =
  | { ok: true; uri: string }
  | { ok: false; reason: 'permission_denied' | 'canceled' };

export async function pickPetPhotoFromGallery(): Promise<PickPetPhotoResult> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (!permission.granted) {
    return { ok: false, reason: 'permission_denied' };
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  });

  if (result.canceled || result.assets.length === 0) {
    return { ok: false, reason: 'canceled' };
  }

  return { ok: true, uri: result.assets[0].uri };
}
