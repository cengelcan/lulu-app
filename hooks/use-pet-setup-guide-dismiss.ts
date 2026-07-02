import { useCallback, useEffect, useState } from 'react';

import {
  dismissPetSetupGuide,
  isPetSetupGuideDismissed,
} from '@/storage/prefs.storage';

export function usePetSetupGuideDismiss(petId: string | undefined) {
  const [isDismissed, setIsDismissed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!petId) {
      setIsDismissed(false);
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    setIsLoading(true);

    void isPetSetupGuideDismissed(petId).then((dismissed) => {
      if (isMounted) {
        setIsDismissed(dismissed);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [petId]);

  const dismiss = useCallback(async () => {
    if (!petId) {
      return;
    }

    await dismissPetSetupGuide(petId);
    setIsDismissed(true);
  }, [petId]);

  return { isDismissed, isLoading, dismiss };
}
