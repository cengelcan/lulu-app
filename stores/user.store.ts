import type { Session } from '@supabase/supabase-js';
import { create } from 'zustand';

import {
  type AuthErrorCode,
  deleteAccount as authDeleteAccount,
  getCurrentSession,
  onAuthStateChange,
  signInWithEmail as authSignInWithEmail,
  signOutUser,
  signUpWithEmail as authSignUpWithEmail,
} from '@/services/auth';
import { wipeUserScopedData } from '@/services/cleanup/wipe-user-scoped-data';
import { pullCheckInsIntoLocal } from '@/services/sync/check-ins-sync';
import { deletePetPhotoFiles, pullPetsIntoLocal } from '@/services/sync/pets-sync';
import {
  deleteAvatarFiles,
  pullProfileIntoLocal,
  pushProfile,
  uploadAvatar,
} from '@/services/sync/profile-sync';
import { pullPetRemindersIntoLocal } from '@/services/sync/reminders-sync';
import { pullPetRecordsIntoLocal } from '@/services/sync/records-sync';
import { getCurrentUserId, setCurrentUserId } from '@/storage/prefs.storage';
import { getUserProfile, setUserProfile } from '@/storage/user.storage';
import type { AuthProvider, UserProfile } from '@/types/user';

export type AuthStatus = 'unknown' | 'authenticated' | 'unauthenticated';

type UserState = {
  userId: string | null;
  authStatus: AuthStatus;
  displayName: string | null;
  avatarUri: string | null;
  provider: AuthProvider;
  email: string | null;
  isPlusActive: boolean;
  plusExpiresAt: string | null;
  isLoading: boolean;
  error: string | null;
  initializeAuth: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (
    email: string,
    password: string
  ) => Promise<{ needsEmailConfirmation: boolean }>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  loadUserProfile: () => Promise<void>;
  updateDisplayName: (displayName: string | null) => Promise<void>;
  updateAvatar: (input: {
    uri: string;
    base64: string | null;
    mimeType: string | null;
  }) => Promise<void>;
  clearError: () => void;
};

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && 'code' in error) {
    return (error as { code: AuthErrorCode }).code;
  }
  return error instanceof Error ? error.message : fallback;
}

function resolveProvider(session: Session | null): AuthProvider {
  if (!session) {
    return 'guest';
  }

  const provider = session.user.app_metadata?.provider;

  if (provider === 'apple' || provider === 'google') {
    return provider;
  }

  return 'email';
}

let authSubscriptionStarted = false;

/**
 * Local data is stored per-device. When a different account signs in, wipe the
 * previous user's local data so accounts stay isolated until cloud sync exists.
 * Returns true when a wipe happened.
 */
async function enforceUserDataIsolation(userId: string): Promise<boolean> {
  const previousUserId = await getCurrentUserId();
  let wiped = false;

  if (previousUserId && previousUserId !== userId) {
    await wipeUserScopedData();
    wiped = true;
  }

  await setCurrentUserId(userId);
  return wiped;
}

/**
 * Pulls the user's cloud data into the local cache. Best-effort (offline-safe).
 *
 * Order matters: pets first so check-ins/records satisfy the cloud FK
 * (their pet_id must exist in the cloud pets table before they are pushed up
 * during the first-sync migration).
 */
async function syncUserDataFromCloud(userId: string): Promise<void> {
  try {
    await pullPetsIntoLocal(userId);
    await pullCheckInsIntoLocal(userId);
    await pullPetRecordsIntoLocal(userId);
    await pullPetRemindersIntoLocal(userId);
    const profile = await pullProfileIntoLocal(userId);
    useUserStore.setState({
      displayName: profile.displayName,
      avatarUri: profile.avatarUri,
    });
  } catch (error) {
    console.warn('Failed to sync user data from cloud', error);
  }
}

export const useUserStore = create<UserState>((set, get) => ({
  userId: null,
  authStatus: 'unknown',
  displayName: null,
  avatarUri: null,
  provider: 'guest',
  email: null,
  isPlusActive: false,
  plusExpiresAt: null,
  isLoading: false,
  error: null,

  initializeAuth: async () => {
    const applySession = (session: Session | null) => {
      set({
        userId: session?.user.id ?? null,
        email: session?.user.email ?? null,
        provider: resolveProvider(session),
        authStatus: session ? 'authenticated' : 'unauthenticated',
      });
    };

    if (!authSubscriptionStarted) {
      authSubscriptionStarted = true;
      onAuthStateChange((_event, session) => {
        applySession(session);
      });
    }

    try {
      const session = await getCurrentSession();

      // Reconcile the data-owner marker to the active session on every launch.
      // This claims the current local data for the logged-in user (no wipe) and
      // prevents a stale marker from triggering a spurious wipe on next sign-in.
      // Account isolation is still enforced at the sign-in transition.
      if (session) {
        await setCurrentUserId(session.user.id);
        await syncUserDataFromCloud(session.user.id);
      }

      applySession(session);
    } catch {
      set({ authStatus: 'unauthenticated' });
    }
  },

  signInWithEmail: async (email, password) => {
    set({ error: null });

    try {
      const session = await authSignInWithEmail(email, password);
      const wiped = await enforceUserDataIsolation(session.user.id);
      await syncUserDataFromCloud(session.user.id);
      set({
        userId: session.user.id,
        email: session.user.email ?? null,
        provider: resolveProvider(session),
        authStatus: 'authenticated',
        ...(wiped ? { displayName: null, avatarUri: null } : {}),
      });
    } catch (error) {
      set({ error: getErrorMessage(error, 'errors.unknown') });
      throw error;
    }
  },

  signUpWithEmail: async (email, password) => {
    set({ error: null });

    try {
      const { session, needsEmailConfirmation } = await authSignUpWithEmail(email, password);

      if (session) {
        const wiped = await enforceUserDataIsolation(session.user.id);
        await syncUserDataFromCloud(session.user.id);
        set({
          userId: session.user.id,
          email: session.user.email ?? null,
          provider: resolveProvider(session),
          authStatus: 'authenticated',
          ...(wiped ? { displayName: null, avatarUri: null } : {}),
        });
      }

      return { needsEmailConfirmation };
    } catch (error) {
      set({ error: getErrorMessage(error, 'errors.unknown') });
      throw error;
    }
  },

  signOut: async () => {
    set({ error: null });

    try {
      await signOutUser();
    } finally {
      set({
        userId: null,
        email: null,
        provider: 'guest',
        displayName: null,
        avatarUri: null,
        isPlusActive: false,
        plusExpiresAt: null,
        authStatus: 'unauthenticated',
      });
    }
  },

  deleteAccount: async () => {
    set({ error: null });

    const userId = get().userId;

    // Storage objects are not covered by the auth cascade and can't be deleted
    // from SQL, so remove avatar files via the Storage API first (best-effort).
    if (userId) {
      try {
        await deleteAvatarFiles(userId);
      } catch (error) {
        console.warn('Failed to delete avatar files during account deletion', error);
      }

      try {
        await deletePetPhotoFiles(userId);
      } catch (error) {
        console.warn('Failed to delete pet photo files during account deletion', error);
      }
    }

    try {
      // Requires a valid session, so run before clearing the local session.
      await authDeleteAccount();
    } catch (error) {
      set({ error: getErrorMessage(error, 'errors.unknown') });
      throw error;
    }

    // The account is gone, so a global revoke would fail; clear locally only.
    try {
      await signOutUser('local');
    } catch (error) {
      console.warn('Failed to clear local session after account deletion', error);
    }

    set({
      userId: null,
      email: null,
      provider: 'guest',
      displayName: null,
      avatarUri: null,
      isPlusActive: false,
      plusExpiresAt: null,
      authStatus: 'unauthenticated',
    });
  },

  loadUserProfile: async () => {
    set({ isLoading: true, error: null });

    try {
      const profile = await getUserProfile();
      set({
        displayName: profile.displayName,
        avatarUri: profile.avatarUri,
        isLoading: false,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: getErrorMessage(error, 'errors.loadProfile'),
      });
    }
  },

  updateDisplayName: async (displayName) => {
    const trimmed = displayName?.trim() ?? '';
    const nextDisplayName = trimmed.length > 0 ? trimmed : null;

    set({ error: null });

    try {
      const profile: UserProfile = {
        displayName: nextDisplayName,
        avatarUri: get().avatarUri,
      };

      await setUserProfile(profile);
      set({ displayName: nextDisplayName });

      const userId = get().userId;
      if (userId) {
        try {
          await pushProfile(userId, profile);
        } catch (syncError) {
          console.warn('Failed to sync display name to cloud', syncError);
        }
      }
    } catch (error) {
      set({ error: getErrorMessage(error, 'errors.saveName') });
      throw error;
    }
  },

  updateAvatar: async ({ uri, base64, mimeType }) => {
    set({ error: null });

    const userId = get().userId;
    let avatarUri = uri;
    let remoteSynced = false;

    if (userId && base64) {
      try {
        avatarUri = await uploadAvatar(userId, base64, mimeType);
        remoteSynced = true;
      } catch (syncError) {
        console.warn('Failed to upload avatar to cloud', syncError);
      }
    }

    try {
      const profile: UserProfile = {
        displayName: get().displayName,
        avatarUri,
      };

      await setUserProfile(profile);
      set({ avatarUri });

      // Only persist a cloud-resolvable URL; skip pushing a local file:// uri.
      if (userId && remoteSynced) {
        try {
          await pushProfile(userId, profile);
        } catch (syncError) {
          console.warn('Failed to sync avatar to cloud', syncError);
        }
      }
    } catch (error) {
      set({ error: getErrorMessage(error, 'errors.savePhoto') });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
