import { useCallback, useEffect, useState } from 'react';

import {
  dismissContextualEducation,
  isContextualEducationDismissed,
  type ContextualEducationTopic,
} from '@/storage/contextual-education.storage';

export function useContextualEducation(topic: ContextualEducationTopic) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let active = true;

    void isContextualEducationDismissed(topic).then((dismissed) => {
      if (active) setIsVisible(!dismissed);
    });

    return () => {
      active = false;
    };
  }, [topic]);

  const dismiss = useCallback(() => {
    setIsVisible(false);
    void dismissContextualEducation(topic);
  }, [topic]);

  return { isVisible, dismiss };
}
