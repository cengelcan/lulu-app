import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/Card';
import { Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';

type GroupedSectionProps = {
  title: string;
  children: React.ReactNode;
  cardStyle?: StyleProp<ViewStyle>;
  actionLabel?: string;
  onActionPress?: () => void;
};

export function GroupedSection({
  title,
  children,
  cardStyle,
  actionLabel,
  onActionPress,
}: GroupedSectionProps) {
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const brandAccentColor = useThemeColor({}, 'brandAccent');

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <ThemedText
          lightColor={textSecondaryColor}
          darkColor={textSecondaryColor}
          style={styles.title}>
          {title}
        </ThemedText>
        {actionLabel && onActionPress ? (
          <Pressable
            accessibilityRole="button"
            onPress={onActionPress}
            style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}>
            <ThemedText
              lightColor={brandAccentColor}
              darkColor={brandAccentColor}
              style={styles.action}>
              {actionLabel}
            </ThemedText>
          </Pressable>
        ) : null}
      </View>
      <Card style={[styles.card, cardStyle]}>{children}</Card>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: Spacing.xs,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xs,
    gap: Spacing.sm,
  },
  title: {
    ...Typography.caption,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    flex: 1,
  },
  action: {
    ...Typography.caption,
    fontWeight: '600',
  },
  card: {
    padding: 0,
    gap: 0,
    overflow: 'hidden',
  },
});
