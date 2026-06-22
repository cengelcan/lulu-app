import type { AuthChangeEvent, Session } from '@supabase/supabase-js';

import { supabase } from '@/lib/supabase';

/** Stable error codes the UI can map to localized copy. */
export type AuthErrorCode =
  | 'invalid_credentials'
  | 'email_taken'
  | 'weak_password'
  | 'email_not_confirmed'
  | 'network'
  | 'unknown';

export class AuthError extends Error {
  code: AuthErrorCode;

  constructor(code: AuthErrorCode, message?: string) {
    super(message ?? code);
    this.name = 'AuthError';
    this.code = code;
  }
}

function mapSupabaseAuthError(error: { message?: string; code?: string; status?: number }): AuthError {
  const message = error.message ?? '';
  const code = error.code ?? '';
  const normalized = message.toLowerCase();

  if (code === 'invalid_credentials' || normalized.includes('invalid login credentials')) {
    return new AuthError('invalid_credentials', message);
  }

  if (
    code === 'user_already_exists' ||
    code === 'email_exists' ||
    normalized.includes('already registered') ||
    normalized.includes('already been registered')
  ) {
    return new AuthError('email_taken', message);
  }

  if (code === 'weak_password' || normalized.includes('password should be')) {
    return new AuthError('weak_password', message);
  }

  if (code === 'email_not_confirmed' || normalized.includes('email not confirmed')) {
    return new AuthError('email_not_confirmed', message);
  }

  if (normalized.includes('network') || normalized.includes('fetch')) {
    return new AuthError('network', message);
  }

  return new AuthError('unknown', message);
}

export async function signInWithEmail(email: string, password: string): Promise<Session> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (error) {
    throw mapSupabaseAuthError(error);
  }

  if (!data.session) {
    throw new AuthError('unknown', 'No session returned after sign in');
  }

  return data.session;
}

/**
 * Signs the user up. When email confirmation is enabled in Supabase, no session
 * is returned until the user confirms; `session` will be null in that case.
 */
export async function signUpWithEmail(
  email: string,
  password: string
): Promise<{ session: Session | null; needsEmailConfirmation: boolean }> {
  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
  });

  if (error) {
    throw mapSupabaseAuthError(error);
  }

  return {
    session: data.session,
    needsEmailConfirmation: data.session === null,
  };
}

/**
 * Signs the user out. Use `scope: 'local'` to clear only this device's session
 * without a server round-trip (e.g. after the account has already been deleted,
 * where a global revoke would fail because the user no longer exists).
 */
export async function signOutUser(scope: 'global' | 'local' = 'global'): Promise<void> {
  const { error } = await supabase.auth.signOut({ scope });

  if (error) {
    throw mapSupabaseAuthError(error);
  }
}

/**
 * Permanently deletes the current user's Supabase account via the `delete_user`
 * RPC (a SECURITY DEFINER function). This cascades to the user's cloud data
 * (pets, check-ins, records, profile) and removes their avatar files.
 */
export async function deleteAccount(): Promise<void> {
  const { error } = await supabase.rpc('delete_user');

  if (error) {
    throw mapSupabaseAuthError(error);
  }
}

export async function getCurrentSession(): Promise<Session | null> {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    throw mapSupabaseAuthError(error);
  }

  return data.session;
}

export function onAuthStateChange(
  callback: (event: AuthChangeEvent, session: Session | null) => void
) {
  const { data } = supabase.auth.onAuthStateChange(callback);
  return data.subscription;
}
