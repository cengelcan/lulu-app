import { supabase } from '@/lib/supabase';

/**
 * Returns the authenticated user's id for cloud writes. Validates the session
 * with Supabase Auth (not just local storage) so RLS sees auth.uid().
 */
export async function requireAuthenticatedUserId(): Promise<string> {
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (!userError && userData.user) {
    return userData.user.id;
  }

  const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();

  if (refreshError || !refreshData.session || !refreshData.user) {
    throw new Error(
      userError?.message ?? refreshError?.message ?? 'Not authenticated for cloud sync'
    );
  }

  return refreshData.user.id;
}
