import {
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { Spacing } from '@/constants/theme';
import { getScreenHorizontalPadding, LayoutTokens } from '@/constants/layout';
import { useThemeColor } from '@/hooks/use-theme-color';

type ScreenContainerProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  scrollable?: boolean;
  edges?: Edge[];
  maxContentWidth?: number;
  footer?: React.ReactNode;
};

export function ScreenContainer({
  children,
  style,
  contentStyle,
  scrollable = false,
  edges = ['top', 'bottom'],
  maxContentWidth = LayoutTokens.readingContentMaxWidth,
  footer,
}: ScreenContainerProps) {
  const { width } = useWindowDimensions();
  const backgroundColor = useThemeColor({}, 'background');
  const horizontalPadding = getScreenHorizontalPadding(width);
  const responsiveContentStyle = {
    maxWidth: maxContentWidth,
    paddingHorizontal: horizontalPadding,
  } as const;

  const content = scrollable ? (
    <ScrollView
      style={styles.scroll}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={[styles.scrollContent, responsiveContentStyle, contentStyle]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}>
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.content, responsiveContentStyle, contentStyle]}>{children}</View>
  );

  const footerContent = footer ? (
    <View style={[styles.footer, responsiveContentStyle]}>{footer}</View>
  ) : null;

  return (
    <SafeAreaView edges={edges} style={[styles.container, { backgroundColor }, style]}>
      {content}
      {footerContent}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    width: '100%',
    alignSelf: 'center',
    paddingVertical: Spacing.md,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    width: '100%',
    alignSelf: 'center',
    paddingVertical: Spacing.md,
  },
  footer: {
    width: '100%',
    alignSelf: 'center',
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
  },
});
