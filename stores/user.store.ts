import type { Session } from '@supabase/supabase-js';
import { create } from 'zustand';

import {
  type AuthErrorCode,
  getCurrentSession,
  onAuthStateChange,
  signInWithEmail as authSignInWithEmail,
  signOutUser,
  signUpWithEmail as authSignUpWithEmail,
} from '@/services/auth';
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
  isLoading: boolean;
  error: string | null;
  initializeAuth: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (
    email: string,
    password: string
  ) => Promise<{ needsEmailConfirmation: boolean }>;
  signOut: () => Promise<void>;
  loadUserProfile: () => Promise<void>;
  updateDisplayName: (displayName: string | null) => Promise<void>;
  updateAvatarUri: (avatarUri: string | null) => Promise<void>;
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

export const useUserStore = create<UserState>((set, get) => ({
  userId: null,
  authStatus: 'unknown',
  displayName: null,
  avatarUri: null,
  provider: 'guest',
  email: null,
  isPlusActive: false,
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
      applySession(session);
    } catch {
      set({ authStatus: 'unauthenticated' });
    }
  },

  signInWithEmail: async (email, password) => {
    set({ error: null });

    try {
      const session = await authSignInWithEmail(email, password);
      set({
        userId: session.user.id,
        email: session.user.email ?? null,
        provider: resolveProvider(session),
        authStatus: 'authenticated',
      });
    } catch (error) {
      set({ error: getErrorMessage(error, 'unknown') });
      throw error;
    }
  },

  signUpWithEmail: async (email, password) => {
    set({ error: null });

    try {
      const { session, needsEmailConfirmation } = await authSignUpWithEmail(email, password);

      if (session) {
        set({
          userId: session.user.id,
          email: session.user.email ?? null,
          provider: resolveProvider(session),
          authStatus: 'authenticated',
        });
      }

      return { needsEmailConfirmation };
    } catch (error) {
      set({ error: getErrorMessage(error, 'unknown') });
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
        authStatus: 'unauthenticated',
      });
    }
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
        error: getErrorMessage(error, 'Failed to load profile'),
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
    } catch (error) {
      set({ error: getErrorMessage(error, 'Failed to save name') });
      throw error;
    }
  },

  updateAvatarUri: async (avatarUri) => {
    set({ error: null });

    try {
      const profile: UserProfile = {
        displayName: get().displayName,
        avatarUri,
      };

      await setUserProfile(profile);
      set({ avatarUri });
    } catch (error) {
      set({ error: getErrorMessage(error, 'Failed to save photo') });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
