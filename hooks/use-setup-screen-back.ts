import { useRouter } from 'expo-router';
import { useCallback, useMemo } from 'react';

import { type SetupMode } from '@/hooks/use-setup-mode';

export function useSetupScreenBack(step: number, mode: SetupMode) {
  const router = useRouter();

  const showBack = step > 1 || mode === 'add';

  const onBack = useCallback(() => {
    router.back();
  }, [router]);

  return useMemo(() => ({ showBack, onBack }), [onBack, showBack]);
}
