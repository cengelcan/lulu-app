export type AuthProvider = 'apple' | 'google' | 'email' | 'guest';

export type User = {
  id: string;
  email: string | null;
  provider: AuthProvider;
  createdAt: string;
};

export type UserProfile = {
  displayName: string | null;
  avatarUri: string | null;
};

export const DISPLAY_NAME_MAX_LENGTH = 50;
