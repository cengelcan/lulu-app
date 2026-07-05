import type { Session } from '@supabase/supabase-js';
import { create } from 'zustand';

import {
  type AuthErrorCode,
  deleteAccount as authDeleteAccount,
  getCurrentSession,
  onAuthStateChange,
  signInWithEmail as authSignInWithEmail,
  signInWithApple as authSignInWithApple,
  signOutUser,
  signUpWithEmail as authSignUpWithEmail,
} from '@/services/auth';
import { wipeUserScopedData } from '@/services/cleanup/wipe-user-scoped-data';
import { resetUserScopedStores } from '@/services/cleanup/reset-user-scoped-stores';
import {
  initializeSubscription,
  teardownSubscription,
} from '@/services/subscription/lifecycle';
import { pullCheckInsIntoLocal } from '@/services/sync/check-ins-sync';
import { deletePetPhotoFiles, pullPetsIntoLocal } from '@/services/sync/pets-sync';
import { requireAuthenticatedUserId } from '@/services/sync/require-authenticated-user-id';
import {
  deleteAvatarFiles,
  pullProfileIntoLocal,
  pushProfile,
  uploadAvatar,
} from '@/services/sync/profile-sync';
import { pullPetRemindersIntoLocal } from '@/services/sync/reminders-sync';
import { pullPetRecordsIntoLocal } from '@/services/sync/records-sync';
import { getCurrentUserId, setCurrentUserId, removeCurrentUserId } from '@/storage/prefs.storage';
import { getUserProfile, setUserProfile } from '@/storage/user.storage';
import type { PlusSubscriptionDetails } from '@/services/subscription/plus-status';
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
  plusSubscription: PlusSubscriptionDetails | null;
  isLoading: boolean;
  error: string | null;
  initializeAuth: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signInWithApple: () => Promise<void>;
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
  const shouldWipe = previousUserId !== null && previousUserId !== userId;

  if (shouldWipe) {
    await wipeUserScopedData();
    resetUserScopedStores();
  }

  await setCurrentUserId(userId);
  return shouldWipe;
}

function isRlsPolicyError(error: unknown): boolean {
  return (
    error instanceof Error &&
    error.message.includes('row-level security policy')
  );
}

async function syncUserDataFromCloud(): Promise<void> {
  let retriedAfterRlsFailure = false;

  while (true) {
    try {
      const userId = await requireAuthenticatedUserId();
      await pullPetsIntoLocal(userId);
      await pullCheckInsIntoLocal(userId);
      await pullPetRecordsIntoLocal(userId);
      await pullPetRemindersIntoLocal(userId);
      const profile = await pullProfileIntoLocal(userId);
      useUserStore.setState({
        displayName: profile.displayName,
        avatarUri: profile.avatarUri,
      });
      return;
    } catch (error) {
      if (!retriedAfterRlsFailure && isRlsPolicyError(error)) {
        console.warn(
          'Cloud sync hit RLS with stale local data — clearing local cache and retrying',
          error
        );
        await wipeUserScopedData();
        resetUserScopedStores();
        retriedAfterRlsFailure = true;
        continue;
      }

      console.warn('Failed to sync user data from cloud', error);
      return;
    }
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
  plusSubscription: null,
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

        if (session) {
          void initializeSubscription(session.user.id);
        } else {
          void teardownSubscription();
        }
      });
    }

    try {
      const session = await getCurrentSession();

      // Enforce isolation when the stored data-owner marker differs from the
      // active session (account switch) or when local cache exists without a
      // marker (e.g. after sign-out cleared the marker but left stale data).
      if (session) {
        applySession(session);
        const wiped = await enforceUserDataIsolation(session.user.id);
        await syncUserDataFromCloud();
        await initializeSubscription(session.user.id);
        if (wiped) {
          set({ displayName: null, avatarUri: null });
        }
      } else {
        applySession(session);
        await teardownSubscription();
      }
    } catch {
      set({ authStatus: 'unauthenticated' });
    }
  },

  signInWithEmail: async (email, password) => {
    set({ error: null });

    try {
      const session = await authSignInWithEmail(email, password);
      const wiped = await enforceUserDataIsolation(session.user.id);
      await syncUserDataFromCloud();
      await initializeSubscription(session.user.id);
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

  signInWithApple: async () => {
    set({ error: null });

    try {
      const result = await authSignInWithApple();

      if (result.status === 'cancelled') {
        return;
      }

      const { session } = result;
      const wiped = await enforceUserDataIsolation(session.user.id);
      await syncUserDataFromCloud();
      await initializeSubscription(session.user.id);

      set({
        userId: session.user.id,
        email: session.user.email ?? null,
        provider: resolveProvider(session),
        authStatus: 'authenticated',
        ...(wiped ? { displayName: null, avatarUri: null } : {}),
      });

      const fullName =
        typeof session.user.user_metadata?.full_name === 'string'
          ? session.user.user_metadata.full_name.trim()
          : '';

      if (fullName && !get().displayName) {
        try {
          await get().updateDisplayName(fullName);
        } catch (nameError) {
          console.warn('Failed to save Apple display name to profile', nameError);
        }
      }
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
        await syncUserDataFromCloud();
        await initializeSubscription(session.user.id);
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
      await teardownSubscription();
      await wipeUserScopedData();
      resetUserScopedStores();
      await removeCurrentUserId();
      set({
        userId: null,
        email: null,
        provider: 'guest',
        displayName: null,
        avatarUri: null,
        isPlusActive: false,
        plusExpiresAt: null,
        plusSubscription: null,
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

    await teardownSubscription();

    set({
      userId: null,
      email: null,
      provider: 'guest',
      displayName: null,
      avatarUri: null,
      isPlusActive: false,
      plusExpiresAt: null,
      plusSubscription: null,
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
