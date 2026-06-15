import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/Card';
import { Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';

type GroupedSectionProps = {
  title: string;
  children: React.ReactNode;
  cardStyle?: StyleProp<ViewStyle>;
};

export function GroupedSection({ title, children, cardStyle }: GroupedSectionProps) {
  const textSecondaryColor = useThemeColor({}, 'textSecondary');

  return (
    <View style={styles.section}>
      <ThemedText
        lightColor={textSecondaryColor}
        darkColor={textSecondaryColor}
        style={styles.title}>
        {title}
      </ThemedText>
      <Card style={[styles.card, cardStyle]}>{children}</Card>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: Spacing.xs,
  },
  title: {
    ...Typography.caption,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    paddingHorizontal: Spacing.xs,
  },
  card: {
    padding: 0,
    gap: 0,
    overflow: 'hidden',
  },
});
