import { StyleSheet, View } from 'react-native';

import { InboxItemRow } from '@/components/inbox/InboxItemRow';
import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/Card';
import { Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTranslation } from '@/hooks/use-translation';
import type { InboxItem, InboxSection } from '@/types/inbox';

type InboxSectionViewProps = {
  section: InboxSection;
  showPetName: boolean;
  onItemPress: (item: InboxItem) => void;
};

export function InboxSectionView({ section, showPetName, onItemPress }: InboxSectionViewProps) {
  const { t } = useTranslation();
  const textSecondaryColor = useThemeColor({}, 'textSecondary');

  return (
    <View style={styles.section}>
      <ThemedText
        lightColor={textSecondaryColor}
        darkColor={textSecondaryColor}
        style={styles.title}>
        {t(section.titleKey)}
      </ThemedText>
      <Card style={styles.card}>
        {section.items.map((item, index) => (
          <InboxItemRow
            key={item.id}
            item={item}
            showPetName={showPetName}
            isLast={index === section.items.length - 1}
            onPress={onItemPress}
          />
        ))}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: Spacing.sm,
  },
  title: {
    ...Typography.caption,
    fontWeight: '600',
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
