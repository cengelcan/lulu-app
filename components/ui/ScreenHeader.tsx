import { HeaderBackButton } from '@react-navigation/elements';
import { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useAndroidBackHandler } from '@/hooks/use-android-back-handler';
import { useThemeColor } from '@/hooks/use-theme-color';

type ScreenHeaderProps = {
  onBack: () => void;
  title?: string;
  backLabel?: string;
};

export function ScreenHeader({ onBack, title, backLabel }: ScreenHeaderProps) {
  const primaryColor = useThemeColor({}, 'primary');

  useAndroidBackHandler(
    useCallback(() => {
      onBack();
      return true;
    }, [onBack])
  );

  return (
    <View style={styles.container}>
      <HeaderBackButton
        label={backLabel}
        tintColor={primaryColor}
        onPress={onBack}
      />
      {title ? (
        <ThemedText type="defaultSemiBold" style={styles.title}>
          {title}
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  title: {
    flex: 1,
  },
});
