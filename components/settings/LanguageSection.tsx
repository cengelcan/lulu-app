import * as Haptics from 'expo-haptics';
import { ActionSheetIOS, Alert, Platform } from 'react-native';

import { GroupedSection } from '@/components/pet/GroupedSection';
import { SettingsValueRow } from '@/components/settings/SettingsValueRow';
import { useTranslation } from '@/hooks/use-translation';
import type { AppLanguagePreference } from '@/types/language';

type LanguageSectionProps = {
  language: AppLanguagePreference;
  onSelect: (language: AppLanguagePreference) => void;
};

const LANGUAGE_OPTIONS: AppLanguagePreference[] = ['system', 'en', 'de'];

function getLanguageLabel(
  t: (key: string) => string,
  preference: AppLanguagePreference
): string {
  switch (preference) {
    case 'system':
      return t('settings.languageSystem');
    case 'en':
      return t('settings.languageEnglish');
    case 'de':
      return t('settings.languageGerman');
  }
}

function showLanguagePicker(
  current: AppLanguagePreference,
  onSelect: (language: AppLanguagePreference) => void,
  title: string,
  cancelLabel: string,
  optionLabels: string[]
): void {
  if (Platform.OS === 'ios') {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    ActionSheetIOS.showActionSheetWithOptions(
      {
        title,
        options: [...optionLabels, cancelLabel],
        cancelButtonIndex: LANGUAGE_OPTIONS.length,
      },
      (buttonIndex) => {
        if (buttonIndex >= 0 && buttonIndex < LANGUAGE_OPTIONS.length) {
          onSelect(LANGUAGE_OPTIONS[buttonIndex]);
        }
      }
    );
    return;
  }

  Alert.alert(title, undefined, [
    ...LANGUAGE_OPTIONS.map((option, index) => ({
      text: optionLabels[index],
      onPress: () => onSelect(option),
      ...(option === current ? { isPreferred: true } : {}),
    })),
    { text: cancelLabel, style: 'cancel' },
  ]);
}

export function LanguageSection({ language, onSelect }: LanguageSectionProps) {
  const { t } = useTranslation();
  const optionLabels = LANGUAGE_OPTIONS.map((option) => getLanguageLabel(t, option));

  const handlePress = () => {
    showLanguagePicker(
      language,
      onSelect,
      t('settings.language'),
      t('common.cancel'),
      optionLabels
    );
  };

  return (
    <GroupedSection title={t('settings.general')}>
      <SettingsValueRow
        label={t('settings.language')}
        value={getLanguageLabel(t, language)}
        onPress={handlePress}
        isLast
      />
    </GroupedSection>
  );
}
