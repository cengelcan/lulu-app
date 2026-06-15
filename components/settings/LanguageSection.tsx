import * as Haptics from 'expo-haptics';
import { ActionSheetIOS, Alert, Platform } from 'react-native';

import { GroupedSection } from '@/components/pet/GroupedSection';
import { SettingsValueRow } from '@/components/settings/SettingsValueRow';
import { useTranslation } from '@/hooks/use-translation';
import {
  APP_LANGUAGE_LABELS,
  type AppLanguage,
} from '@/types/language';

type LanguageSectionProps = {
  language: AppLanguage;
  onSelect: (language: AppLanguage) => void;
};

const LANGUAGE_OPTIONS: AppLanguage[] = ['en', 'tr'];

function showLanguagePicker(
  current: AppLanguage,
  onSelect: (language: AppLanguage) => void,
  title: string,
  cancelLabel: string
): void {
  if (Platform.OS === 'ios') {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    ActionSheetIOS.showActionSheetWithOptions(
      {
        title,
        options: [...LANGUAGE_OPTIONS.map((key) => APP_LANGUAGE_LABELS[key]), cancelLabel],
        cancelButtonIndex: 2,
      },
      (buttonIndex) => {
        if (buttonIndex === 0 || buttonIndex === 1) {
          onSelect(LANGUAGE_OPTIONS[buttonIndex]);
        }
      }
    );
    return;
  }

  Alert.alert(title, undefined, [
    ...LANGUAGE_OPTIONS.map((option) => ({
      text: APP_LANGUAGE_LABELS[option],
      onPress: () => onSelect(option),
      ...(option === current ? { isPreferred: true } : {}),
    })),
    { text: cancelLabel, style: 'cancel' },
  ]);
}

export function LanguageSection({ language, onSelect }: LanguageSectionProps) {
  const { t } = useTranslation();

  const handlePress = () => {
    showLanguagePicker(language, onSelect, t('settings.language'), t('common.cancel'));
  };

  return (
    <GroupedSection title={t('settings.general')}>
      <SettingsValueRow
        label={t('settings.language')}
        value={APP_LANGUAGE_LABELS[language]}
        onPress={handlePress}
        isLast
      />
    </GroupedSection>
  );
}
