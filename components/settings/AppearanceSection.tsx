import * as Haptics from 'expo-haptics';
import { ActionSheetIOS, Alert, Platform } from 'react-native';

import { GroupedSection } from '@/components/pet/GroupedSection';
import { SettingsValueRow } from '@/components/settings/SettingsValueRow';
import {
  APP_APPEARANCE_LABELS,
  type AppAppearance,
} from '@/types/appearance';

type AppearanceSectionProps = {
  appearance: AppAppearance;
  onSelect: (appearance: AppAppearance) => void;
};

const APPEARANCE_OPTIONS: AppAppearance[] = ['system', 'light', 'dark'];

function showAppearancePicker(
  current: AppAppearance,
  onSelect: (appearance: AppAppearance) => void
): void {
  if (Platform.OS === 'ios') {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    ActionSheetIOS.showActionSheetWithOptions(
      {
        title: 'Theme',
        options: [...APPEARANCE_OPTIONS.map((key) => APP_APPEARANCE_LABELS[key]), 'Cancel'],
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

  Alert.alert('Theme', undefined, [
    ...APPEARANCE_OPTIONS.map((option) => ({
      text: APP_APPEARANCE_LABELS[option],
      onPress: () => onSelect(option),
      ...(option === current ? { isPreferred: true } : {}),
    })),
    { text: 'Cancel', style: 'cancel' },
  ]);
}

export function AppearanceSection({ appearance, onSelect }: AppearanceSectionProps) {
  const handlePress = () => {
    showAppearancePicker(appearance, onSelect);
  };

  return (
    <GroupedSection title="Appearance">
      <SettingsValueRow
        label="Theme"
        value={APP_APPEARANCE_LABELS[appearance]}
        onPress={handlePress}
        isLast
      />
    </GroupedSection>
  );
}
