import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol, type IconSymbolName } from '@/components/ui/icon-symbol';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';

type NotificationPermissionPromptProps = {
  petName: string;
  previewTitle: string;
  previewBody: string;
  previewNameFallback: string;
  previewAppName: string;
  previewTimeLabel: string;
  benefitDaily: string;
  benefitSettings: string;
  hint: string;
};

type BenefitRowProps = {
  icon: IconSymbolName;
  label: string;
  brandAccentColor: string;
  brandAccentSoft: string;
  textColor: string;
  borderColor: string;
  isLast?: boolean;
};

function BenefitRow({
  icon,
  label,
  brandAccentColor,
  brandAccentSoft,
  textColor,
  borderColor,
  isLast = false,
}: BenefitRowProps) {
  return (
    <View style={[styles.benefitRow, { borderColor }, isLast && styles.benefitRowLast]}>
      <View style={[styles.benefitIcon, { backgroundColor: brandAccentSoft }]}>
        <IconSymbol name={icon} size={16} color={brandAccentColor} />
      </View>
      <ThemedText lightColor={textColor} darkColor={textColor} style={styles.benefitLabel}>
        {label}
      </ThemedText>
      <View style={[styles.benefitCheck, { backgroundColor: brandAccentSoft }]}>
        <IconSymbol name="checkmark.circle" size={18} color={brandAccentColor} />
      </View>
    </View>
  );
}

export function NotificationPermissionPrompt({
  petName,
  previewTitle,
  previewBody,
  previewNameFallback,
  previewAppName,
  previewTimeLabel,
  benefitDaily,
  benefitSettings,
  hint,
}: NotificationPermissionPromptProps) {
  const brandAccentColor = useThemeColor({}, 'brandAccent');
  const brandAccentSoft = useThemeColor({}, 'brandAccentSoft');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const surfaceElevatedColor = useThemeColor({}, 'surfaceElevated');
  const borderColor = useThemeColor({}, 'border');

  const previewMessage = previewBody.replace('{{name}}', petName.trim() || previewNameFallback);

  return (
    <View style={styles.container}>
      <View style={[styles.previewCard, { borderColor }]}>
        <View style={styles.previewHeader}>
          <View style={styles.previewApp}>
            <View style={[styles.previewAppIcon, { backgroundColor: brandAccentSoft }]}>
              <IconSymbol name="pawprint.fill" size={14} color={brandAccentColor} />
            </View>
            <ThemedText
              lightColor={Palette.ink}
              darkColor={Palette.ink}
              style={styles.previewAppName}>
              {previewAppName}
            </ThemedText>
          </View>
          <ThemedText
            lightColor={Palette.muted}
            darkColor={Palette.muted}
            style={styles.previewTime}>
            {previewTimeLabel}
          </ThemedText>
        </View>

        <ThemedText
          lightColor={Palette.ink}
          darkColor={Palette.ink}
          style={styles.previewTitle}>
          {previewTitle}
        </ThemedText>
        <ThemedText lightColor={Palette.body} darkColor={Palette.body} style={styles.previewBody}>
          {previewMessage}
        </ThemedText>
      </View>

      <View style={[styles.benefitsCard, { backgroundColor: surfaceElevatedColor, borderColor }]}>
        <BenefitRow
          icon="bell.fill"
          label={benefitDaily}
          brandAccentColor={brandAccentColor}
          brandAccentSoft={brandAccentSoft}
          textColor={Palette.onDark}
          borderColor={borderColor}
          isLast={false}
        />
        <BenefitRow
          icon="slider.horizontal.3"
          label={benefitSettings}
          brandAccentColor={brandAccentColor}
          brandAccentSoft={brandAccentSoft}
          textColor={Palette.onDark}
          borderColor={borderColor}
          isLast
        />
      </View>

      <View style={styles.hintRow}>
        <IconSymbol name="shield.fill" size={16} color={brandAccentColor} />
        <ThemedText
          lightColor={textSecondaryColor}
          darkColor={textSecondaryColor}
          style={styles.hint}>
          {hint}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'stretch',
    gap: Spacing.lg,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.lg,
  },
  previewCard: {
    backgroundColor: '#EBEBEB',
    borderRadius: Radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    gap: Spacing.xs,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  previewApp: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    flex: 1,
  },
  previewAppIcon: {
    width: 24,
    height: 24,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewAppName: {
    ...Typography.caption,
    fontWeight: '700',
  },
  previewTime: {
    ...Typography.caption,
    fontWeight: '500',
  },
  previewTitle: {
    ...Typography.bodySemiBold,
    marginTop: Spacing.xxs,
    color: Palette.ink,
  },
  previewBody: {
    ...Typography.body,
    lineHeight: 22,
  },
  benefitsCard: {
    borderRadius: Radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  benefitRowLast: {
    borderBottomWidth: 0,
  },
  benefitIcon: {
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitLabel: {
    ...Typography.body,
    flex: 1,
    lineHeight: 22,
  },
  benefitCheck: {
    width: 28,
    height: 28,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.xs,
  },
  hint: {
    ...Typography.body,
    textAlign: 'center',
    lineHeight: 22,
    flexShrink: 1,
  },
});
