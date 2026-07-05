import { Stack } from 'expo-router';

import { CreateFamilyContent } from '@/components/family/CreateFamilyContent';
import { useTranslation } from '@/hooks/use-translation';

export default function CreateFamilyScreen() {
  const { t } = useTranslation();

  return (
    <>
      <Stack.Screen options={{ title: t('family.create.title') }} />
      <CreateFamilyContent />
    </>
  );
}
