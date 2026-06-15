import { pickImageFromGallery, type PickImageResult } from '@/services/pick-image-from-gallery';

export type PickPetPhotoResult = PickImageResult;

export async function pickPetPhotoFromGallery(): Promise<PickPetPhotoResult> {
  return pickImageFromGallery();
}
