import * as Haptics from 'expo-haptics';
import { ActionSheetIOS, Alert, Platform } from 'react-native';

import { GroupedSection } from '@/components/pet/GroupedSection';
import { SettingsValueRow } from '@/components/settings/SettingsValueRow';
import { useTranslation } from '@/hooks/use-translation';
import {
  type AppAppearance,
} from '@/types/appearance';

type AppearanceSectionProps = {
  appearance: AppAppearance;
  onSelect: (appearance: AppAppearance) => void;
};

const APPEARANCE_OPTIONS: AppAppearance[] = ['system', 'light', 'dark'];

function showAppearancePicker(
  current: AppAppearance,
  onSelect: (appearance: AppAppearance) => void,
  title: string,
  labels: Record<AppAppearance, string>,
  cancelLabel: string
): void {
  if (Platform.OS === 'ios') {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    ActionSheetIOS.showActionSheetWithOptions(
      {
        title,
        options: [...APPEARANCE_OPTIONS.map((key) => labels[key]), cancelLabel],
        cancelButtonIndex: 3,
      },
      (buttonIndex) => {
        if (buttonIndex === 0 || buttonIndex === 1 || buttonIndex === 2) {
          onSelect(APPEARANCE_OPTIONS[buttonIndex]);
        }
      }
    );
    return;
  }

  Alert.alert(title, undefined, [
    ...APPEARANCE_OPTIONS.map((option) => ({
      text: labels[option],
      onPress: () => onSelect(option),
      ...(option === current ? { isPreferred: true } : {}),
    })),
    { text: cancelLabel, style: 'cancel' },
  ]);
}

export function AppearanceSection({ appearance, onSelect }: AppearanceSectionProps) {
  const { t } = useTranslation();

  const labels: Record<AppAppearance, string> = {
    system: t('settings.themeSystem'),
    light: t('settings.themeLight'),
    dark: t('settings.themeDark'),
  };

  const handlePress = () => {
    showAppearancePicker(appearance, onSelect, t('settings.theme'), labels, t('common.cancel'));
  };

  return (
    <GroupedSection title={t('settings.appearance')}>
      <SettingsValueRow
        label={t('settings.theme')}
        value={labels[appearance]}
        onPress={handlePress}
        isLast
      />
    </GroupedSection>
  );
}
