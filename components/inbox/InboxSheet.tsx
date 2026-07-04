import { useRouter } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { InboxSectionView } from '@/components/inbox/InboxSection';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/Button';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Radius, Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTranslation } from '@/hooks/use-translation';
import type { InboxItem, InboxSection } from '@/types/inbox';
import { translateError } from '@/utils/translate-error';

type InboxSheetProps = {
  sections: InboxSection[];
  isLoading: boolean;
  error: string | null;
  showPetName: boolean;
  onClose: () => void;
  onRefresh: () => void;
};

export function InboxSheet({
  sections,
  isLoading,
  error,
  showPetName,
  onClose,
  onRefresh,
}: InboxSheetProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const borderColor = useThemeColor({}, 'border');
  const surfaceColor = useThemeColor({}, 'surface');
  const primaryColor = useThemeColor({}, 'primary');
  const resolvedError = translateError(t, error);
  const isEmpty = !isLoading && !error && sections.length === 0;

  const handleItemPress = (item: InboxItem) => {
    onClose();
    router.push(item.route);
  };

  return (
    <View style={styles.root}>
      <View style={[styles.header, { borderBottomColor: borderColor }]}>
        <ThemedText type="defaultSemiBold" style={styles.title}>
          {t('inbox.title')}
        </ThemedText>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('common.cancel')}
          hitSlop={8}
          onPress={onClose}
          style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}>
          <IconSymbol name="xmark.circle" size={24} color={textSecondaryColor} />
        </Pressable>
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={primaryColor} size="small" />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <ThemedText style={styles.message}>{resolvedError}</ThemedText>
          <Button title={t('common.tryAgain')} onPress={() => void onRefresh()} />
        </View>
      ) : isEmpty ? (
        <View style={[styles.emptyState, { backgroundColor: surfaceColor, borderColor }]}>
          <ThemedText
            lightColor={textSecondaryColor}
            darkColor={textSecondaryColor}
            style={styles.emptyText}>
            {t('inbox.allCaughtUp')}
          </ThemedText>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          {sections.map((section) => (
            <InboxSectionView
              key={section.category}
              section={section}
              showPetName={showPetName}
              onItemPress={handleItemPress}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingTop: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  title: {
    ...Typography.titleSmall,
  },
  content: {
    padding: Spacing.lg,
    gap: Spacing.lg,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    padding: Spacing.lg,
  },
  message: {
    ...Typography.body,
    textAlign: 'center',
  },
  emptyState: {
    margin: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.lg,
  },
  emptyText: {
    ...Typography.body,
    textAlign: 'center',
  },
});
