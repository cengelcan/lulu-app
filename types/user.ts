export type AuthProvider = 'apple' | 'google' | 'email' | 'guest';

export type User = {
  id: string;
  email: string | null;
  provider: AuthProvider;
  createdAt: string;
};
