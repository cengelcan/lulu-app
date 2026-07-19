import type { NotificationPermissionStatus } from '@/storage/prefs.storage';

type InitialSetupFinalizationDeps<Pet> = {
  createPet: () => Promise<Pet>;
  setActivePet: (pet: Pet) => Promise<void>;
  savePermission: (
    permission: NotificationPermissionStatus
  ) => Promise<NotificationPermissionStatus>;
  resetDraft: () => void;
  navigateToComplete: () => void;
  onNotificationError?: (error: unknown) => void;
};

export async function runInitialSetupFinalization<Pet>(
  permission: NotificationPermissionStatus,
  deps: InitialSetupFinalizationDeps<Pet>
): Promise<NotificationPermissionStatus> {
  const pet = await deps.createPet();
  await deps.setActivePet(pet);

  // Notifications are optional setup. A native permission/scheduling failure
  // must not strand onboarding after the pet has already been created.
  let resolvedPermission = permission;
  try {
    resolvedPermission = await deps.savePermission(permission);
  } catch (error) {
    deps.onNotificationError?.(error);
  }

  deps.resetDraft();
  deps.navigateToComplete();

  return resolvedPermission;
}
