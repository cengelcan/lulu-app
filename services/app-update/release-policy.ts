import { supabase } from '@/lib/supabase';

export type RemoteAppReleasePolicy = {
  enabled: boolean;
  latestVersion: string;
  minimumSupportedVersion: string;
  storeUrl: string;
  reminderIntervalHours: number;
};

type AppReleasePolicyRow = {
  enabled: boolean;
  latest_version: string;
  minimum_supported_version: string;
  store_url: string;
  reminder_interval_hours: number;
};

const POLICY_REQUEST_TIMEOUT_MS = 5000;

export async function fetchIosAppReleasePolicy(): Promise<RemoteAppReleasePolicy | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), POLICY_REQUEST_TIMEOUT_MS);

  try {
    const { data, error } = await supabase
      .from('app_release_policy')
      .select(
        'enabled, latest_version, minimum_supported_version, store_url, reminder_interval_hours'
      )
      .eq('platform', 'ios')
      .abortSignal(controller.signal)
      .maybeSingle<AppReleasePolicyRow>();

    if (error) {
      throw error;
    }

    if (!data) {
      return null;
    }

    return {
      enabled: data.enabled,
      latestVersion: data.latest_version,
      minimumSupportedVersion: data.minimum_supported_version,
      storeUrl: data.store_url,
      reminderIntervalHours: data.reminder_interval_hours,
    };
  } finally {
    clearTimeout(timeout);
  }
}
