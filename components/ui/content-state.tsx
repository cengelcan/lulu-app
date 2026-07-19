import { ActivityIndicator, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { IconSymbol, type IconSymbolName } from '@/components/ui/icon-symbol';
import { AccessibilityTokens } from '@/constants/accessibility';
import type { ContentStateKind } from '@/constants/content-states';
import { Radius, Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';

type ContentStateProps = {
  kind: ContentStateKind;
  title?: string;
  message?: string | null;
  accessibilityLabel?: string;
  actionLabel?: string;
  onActionPress?: () => void;
  presentation?: 'plain' | 'card';
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

const STATE_ICONS: Partial<Record<ContentStateKind, IconSymbolName>> = {
  error: 'exclamationmark.circle',
  empty: 'checkmark.circle.fill',
  locked: 'lock.fill',
};

export function ContentState({
  kind,
  title,
  message,
  accessibilityLabel,
  actionLabel,
  onActionPress,
  presentation = 'plain',
  style,
  testID,
}: ContentStateProps) {
  const primaryColor = useThemeColor({}, 'primary');
  const messageColor = useThemeColor({}, kind === 'error' ? 'text' : 'textSecondary');
  const accentColor = useThemeColor({}, kind === 'error' ? 'alert' : 'accent');
  const icon = STATE_ICONS[kind];
  const isLoading = kind === 'loading';

  const content = (
    <View
      accessibilityLabel={isLoading ? accessibilityLabel ?? title ?? message ?? undefined : undefined}
      accessibilityLiveRegion={isLoading ? 'polite' : undefined}
      accessible={isLoading || undefined}
      style={styles.content}>
      {isLoading ? (
        <ActivityIndicator accessibilityElementsHidden color={primaryColor} size="large" />
      ) : icon ? (
        <View style={[styles.iconWrap, { backgroundColor: `${accentColor}1F` }]}>
          <IconSymbol name={icon} size={22} color={accentColor} />
        </View>
      ) : null}

      {title && !isLoading ? (
        <ThemedText accessibilityRole="header" type="defaultSemiBold" style={styles.title}>
          {title}
        </ThemedText>
      ) : null}

      {message && !isLoading ? (
        <ThemedText
          accessibilityLiveRegion={kind === 'error' ? 'assertive' : undefined}
          lightColor={messageColor}
          darkColor={messageColor}
          selectable={kind === 'error'}
          style={styles.message}>
          {message}
        </ThemedText>
      ) : null}

      {actionLabel && onActionPress && !isLoading ? (
        <Button title={actionLabel} onPress={onActionPress} style={styles.action} />
      ) : null}
    </View>
  );

  if (presentation === 'card') {
    return (
      <Card style={[styles.wrapper, style]} testID={testID}>
        {content}
      </Card>
    );
  }

  return (
    <View style={[styles.wrapper, style]} testID={testID}>
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    minHeight: 96,
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.lg,
  },
  iconWrap: {
    width: AccessibilityTokens.minimumTouchTarget,
    height: AccessibilityTokens.minimumTouchTarget,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...Typography.bodySemiBold,
    textAlign: 'center',
  },
  message: {
    ...Typography.body,
    textAlign: 'center',
  },
  action: {
    width: '100%',
    maxWidth: 320,
    marginTop: Spacing.xxs,
  },
});
