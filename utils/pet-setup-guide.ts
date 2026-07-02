import type { Href } from 'expo-router';

import type { Pet } from '@/types/pet';
import type { PetRecord } from '@/types/pet-record';

export type PetSetupGuideTaskId = 'photo' | 'checkIn' | 'weight' | 'record' | 'color';

export type PetSetupGuideTask = {
  id: PetSetupGuideTaskId;
  isCompleted: boolean;
  route: Href;
};

export type PetSetupGuideInput = {
  pet: Pet;
  hasTodayCheckIn: boolean;
  records: PetRecord[];
};

export function getPetSetupGuideTasks(input: PetSetupGuideInput): PetSetupGuideTask[] {
  const { pet, hasTodayCheckIn, records } = input;
  const editPetRoute = `/edit-pet?id=${encodeURIComponent(pet.id)}` as Href;

  const hasPhoto = Boolean(pet.photoUri?.trim());
  const hasWeight = records.some(
    (record) => record.type === 'weight' && record.metadata.value > 0
  );
  const hasHealthRecord = records.some((record) => record.type !== 'weight');
  const hasColor = Boolean(pet.color?.trim());

  return [
    { id: 'photo', isCompleted: hasPhoto, route: editPetRoute },
    { id: 'checkIn', isCompleted: hasTodayCheckIn, route: '/check-in' as Href },
    { id: 'weight', isCompleted: hasWeight, route: '/records/weight' as Href },
    { id: 'record', isCompleted: hasHealthRecord, route: '/records' as Href },
    { id: 'color', isCompleted: hasColor, route: editPetRoute },
  ];
}

export function getPetSetupGuideProgress(tasks: PetSetupGuideTask[]): number {
  if (tasks.length === 0) {
    return 100;
  }

  const completedCount = tasks.filter((task) => task.isCompleted).length;
  return Math.round((completedCount / tasks.length) * 100);
}

export function isPetSetupGuideComplete(tasks: PetSetupGuideTask[]): boolean {
  return tasks.every((task) => task.isCompleted);
}

export function shouldShowPetSetupGuide(
  tasks: PetSetupGuideTask[],
  isDismissed: boolean,
  isDeceased: boolean
): boolean {
  if (isDeceased || isDismissed) {
    return false;
  }

  return !isPetSetupGuideComplete(tasks);
}
