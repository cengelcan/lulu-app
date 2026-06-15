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
};

export function ScreenHeader({ onBack, title }: ScreenHeaderProps) {
  const primaryColor = useThemeColor({}, 'primary');

  useAndroidBackHandler(
    useCallback(() => {
      onBack();
      return true;
    }, [onBack])
  );

  return (
    <View style={styles.container}>
      <HeaderBackButton tintColor={primaryColor} onPress={onBack} />
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
