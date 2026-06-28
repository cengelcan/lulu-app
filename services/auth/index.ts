import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';

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

export function getPasswordResetRedirectUrl(): string {
  const envRedirect = process.env.EXPO_PUBLIC_AUTH_REDIRECT_URL?.trim();

  if (envRedirect) {
    return envRedirect;
  }

  // Expo Go: exp://192.168.x.x:8081/--/reset-password
  // Dev/prod build: luluapp://reset-password
  return Linking.createURL('reset-password');
}

function parseParamString(paramsString: string): Record<string, string> {
  const params: Record<string, string> = {};

  for (const part of paramsString.split('&')) {
    if (!part) {
      continue;
    }

    const [rawKey, rawValue = ''] = part.split('=');
    params[decodeURIComponent(rawKey)] = decodeURIComponent(rawValue);
  }

  return params;
}

function parseAuthParamsFromUrl(url: string): Record<string, string> {
  const extractFromUrl = (value: string): Record<string, string> => {
    const hashIndex = value.indexOf('#');
    const queryIndex = value.indexOf('?');
    const paramsString =
      hashIndex >= 0
        ? value.slice(hashIndex + 1)
        : queryIndex >= 0
          ? value.slice(queryIndex + 1)
          : '';

    return parseParamString(paramsString);
  };

  const fromOriginal = extractFromUrl(url);

  if (Object.keys(fromOriginal).length > 0) {
    return fromOriginal;
  }

  // Some platforms deliver Supabase tokens after # instead of ?.
  return extractFromUrl(url.replace('#', '?'));
}

function hasAuthParam(params: Record<string, string>, key: string): boolean {
  return typeof params[key] === 'string' && params[key].length > 0;
}

export function hasAuthParamsInUrl(url: string): boolean {
  const params = parseAuthParamsFromUrl(url);

  return (
    hasAuthParam(params, 'access_token') ||
    hasAuthParam(params, 'refresh_token') ||
    hasAuthParam(params, 'code') ||
    hasAuthParam(params, 'token_hash')
  );
}

export async function setSessionFromUrl(url: string): Promise<Session | null> {
  const params = parseAuthParamsFromUrl(url);
  const { access_token, refresh_token, code, token_hash, type } = params;

  try {
    if (code) {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        console.warn('[auth] Could not exchange code for session', error.message);
        return null;
      }

      return data.session;
    }

    if (token_hash && type === 'recovery') {
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash,
        type: 'recovery',
      });

      if (error) {
        console.warn('[auth] Could not verify recovery token', error.message);
        return null;
      }

      return data.session;
    }

    if (!access_token || !refresh_token) {
      return null;
    }

    const { data, error } = await supabase.auth.setSession({
      access_token,
      refresh_token,
    });

    if (error) {
      console.warn('[auth] Could not set session from URL', error.message);
      return null;
    }

    return data.session;
  } catch (error) {
    console.warn('[auth] Failed to parse auth deep link', error);
    return null;
  }
}

let sessionFromUrlInFlight: Promise<Session | null> | null = null;
let sessionFromUrlKey: string | null = null;

async function establishSessionFromUrl(url: string): Promise<Session | null> {
  if (!hasAuthParamsInUrl(url)) {
    return null;
  }

  if (sessionFromUrlInFlight && sessionFromUrlKey === url) {
    return sessionFromUrlInFlight;
  }

  sessionFromUrlKey = url;
  sessionFromUrlInFlight = setSessionFromUrl(url).finally(() => {
    sessionFromUrlInFlight = null;
    sessionFromUrlKey = null;
  });

  return sessionFromUrlInFlight;
}

export async function ensureRecoverySession(url?: string | null): Promise<Session | null> {
  if (url) {
    const session = await establishSessionFromUrl(url);

    if (session) {
      return session;
    }
  }

  return getCurrentSession();
}

export async function requestPasswordReset(email: string): Promise<void> {
  const redirectTo = getPasswordResetRedirectUrl();

  if (__DEV__) {
    console.warn(
      '[auth] Password reset redirect URL:',
      redirectTo,
      '\nAdd this URL (or exp://**) to Supabase → Auth → URL Configuration → Redirect URLs.'
    );
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
    redirectTo,
  });

  if (error) {
    throw mapSupabaseAuthError(error);
  }
}

export async function updatePassword(password: string): Promise<void> {
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    throw mapSupabaseAuthError(error);
  }
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
