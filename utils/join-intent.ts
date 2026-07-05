import { getPendingFamilyJoinCode } from '@/storage/pending-family-join.storage';
import { getUserSetupPath } from '@/storage/setup-path.storage';

export async function hasJoinIntent(): Promise<boolean> {
  const [pendingCode, setupPath] = await Promise.all([getPendingFamilyJoinCode(), getUserSetupPath()]);

  return Boolean(pendingCode) || setupPath === 'join_family';
}
