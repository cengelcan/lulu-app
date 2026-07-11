import 'react-native-url-polyfill/auto';
import 'react-native-get-random-values';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupabaseClient, type SupabaseClientOptions } from '@supabase/supabase-js';
import * as aesjs from 'aes-js';
import * as SecureStore from 'expo-secure-store';
import { AppState } from 'react-native';

/** Required on iOS 26+ — omitting keychainService can throw NSException via TurboModule at startup. */
const SECURE_STORE_OPTIONS: SecureStore.SecureStoreOptions = {
  keychainService: 'com.luluapp.app',
};

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

async function readSecureStoreKey(key: string): Promise<string | null> {
  try {
    const value = await SecureStore.getItemAsync(key, SECURE_STORE_OPTIONS);
    if (value) {
      return value;
    }

    // Migrate keys written before keychainService was required (pre-iOS-26 fix builds).
    const legacyValue = await SecureStore.getItemAsync(key);
    if (!legacyValue) {
      return null;
    }

    await SecureStore.setItemAsync(key, legacyValue, SECURE_STORE_OPTIONS);
    await SecureStore.deleteItemAsync(key);
    return legacyValue;
  } catch (error) {
    console.warn('[auth storage] SecureStore read failed', error);
    return null;
  }
}

async function writeSecureStoreKey(key: string, value: string): Promise<void> {
  await SecureStore.setItemAsync(key, value, SECURE_STORE_OPTIONS);
  // Best-effort cleanup of a legacy entry stored without keychainService.
  try {
    await SecureStore.deleteItemAsync(key);
  } catch {
    // Legacy key may not exist.
  }
}

async function deleteSecureStoreKey(key: string): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(key, SECURE_STORE_OPTIONS);
    await SecureStore.deleteItemAsync(key);
  } catch (error) {
    console.warn('[auth storage] SecureStore delete failed', error);
  }
}

/**
 * Supabase sessions can exceed SecureStore's ~2KB value limit. Following Supabase's
 * recommended pattern: encrypt the payload with a per-key AES key, keep the ciphertext
 * in AsyncStorage and the encryption key in SecureStore (hardware-backed keychain).
 */
class LargeSecureStore {
  private async encrypt(key: string, value: string): Promise<string> {
    const encryptionKey = crypto.getRandomValues(new Uint8Array(256 / 8));
    const cipher = new aesjs.ModeOfOperation.ctr(encryptionKey, new aesjs.Counter(1));
    const encryptedBytes = cipher.encrypt(aesjs.utils.utf8.toBytes(value));

    try {
      await writeSecureStoreKey(key, aesjs.utils.hex.fromBytes(encryptionKey));
    } catch (error) {
      console.warn('[auth storage] SecureStore write failed', error);
      throw error;
    }

    return aesjs.utils.hex.fromBytes(encryptedBytes);
  }

  private async decrypt(key: string, value: string): Promise<string | null> {
    const encryptionKeyHex = await readSecureStoreKey(key);

    if (!encryptionKeyHex) {
      return null;
    }

    const cipher = new aesjs.ModeOfOperation.ctr(
      aesjs.utils.hex.toBytes(encryptionKeyHex),
      new aesjs.Counter(1)
    );
    const decryptedBytes = cipher.decrypt(aesjs.utils.hex.toBytes(value));

    return aesjs.utils.utf8.fromBytes(decryptedBytes);
  }

  async getItem(key: string): Promise<string | null> {
    const encrypted = await AsyncStorage.getItem(key);

    if (!encrypted) {
      return null;
    }

    return this.decrypt(key, encrypted);
  }

  async setItem(key: string, value: string): Promise<void> {
    const encrypted = await this.encrypt(key, value);
    await AsyncStorage.setItem(key, encrypted);
  }

  async removeItem(key: string): Promise<void> {
    await AsyncStorage.removeItem(key);
    await deleteSecureStoreKey(key);
  }
}

const options: SupabaseClientOptions<'public'> = {
  auth: {
    storage: new LargeSecureStore(),
    autoRefreshToken: true,
    persistSession: true,
    // No URL-based session detection in native; tokens come from native sign-in.
    detectSessionInUrl: false,
  },
};

function createSupabaseClient(): SupabaseClient {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase env vars. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in EAS production env (or .env for local dev).'
    );
  }

  return createClient(supabaseUrl, supabaseAnonKey, options);
}

let supabaseInstance: SupabaseClient | null = null;
let appStateListenerAttached = false;

function getSupabaseClient(): SupabaseClient {
  if (!supabaseInstance) {
    supabaseInstance = createSupabaseClient();

    if (!appStateListenerAttached) {
      appStateListenerAttached = true;

      if (AppState.currentState === 'active') {
        void supabaseInstance.auth.startAutoRefresh();
      }

      AppState.addEventListener('change', (state) => {
        if (state === 'active') {
          void supabaseInstance?.auth.startAutoRefresh();
        } else {
          void supabaseInstance?.auth.stopAutoRefresh();
        }
      });
    }
  }

  return supabaseInstance;
}

export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    const client = getSupabaseClient();
    const value = Reflect.get(client, prop, receiver);
    return typeof value === 'function' ? value.bind(client) : value;
  },
});
