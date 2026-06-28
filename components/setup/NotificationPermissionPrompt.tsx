import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Radius, Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';

type NotificationPermissionPromptProps = {
  petName: string;
  previewTitle: string;
  previewBody: string;
  previewAppName: string;
  previewTimeLabel: string;
  benefitDaily: string;
  benefitSettings: string;
  hint: string;
};

type BenefitRowProps = {
  label: string;
  brandAccentColor: string;
  brandAccentSoft: string;
  textSecondaryColor: string;
};

function BenefitRow({
  label,
  brandAccentColor,
  brandAccentSoft,
  textSecondaryColor,
}: BenefitRowProps) {
  return (
    <View style={styles.benefitRow}>
      <View style={[styles.benefitIcon, { backgroundColor: brandAccentSoft }]}>
        <IconSymbol name="checkmark.circle" size={16} color={brandAccentColor} />
      </View>
      <ThemedText
        lightColor={textSecondaryColor}
        darkColor={textSecondaryColor}
        style={styles.benefitLabel}>
        {label}
      </ThemedText>
    </View>
  );
}

export function NotificationPermissionPrompt({
  petName,
  previewTitle,
  previewBody,
  previewAppName,
  previewTimeLabel,
  benefitDaily,
  benefitSettings,
  hint,
}: NotificationPermissionPromptProps) {
  const brandAccentColor = useThemeColor({}, 'brandAccent');
  const brandAccentSoft = useThemeColor({}, 'brandAccentSoft');
  const brandAccentBorder = useThemeColor({}, 'brandAccentBorder');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const surfaceElevatedColor = useThemeColor({}, 'surfaceElevated');
  const borderColor = useThemeColor({}, 'border');

  const previewMessage = previewBody.replace('{{name}}', petName.trim() || 'your pet');

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <View
          style={[
            styles.iconHalo,
            { backgroundColor: brandAccentSoft, borderColor: brandAccentBorder },
          ]}>
          <View style={[styles.iconCircle, { backgroundColor: brandAccentSoft }]}>
            <IconSymbol name="bell.fill" size={32} color={brandAccentColor} />
          </View>
        </View>
      </View>

      <View
        style={[
          styles.previewCard,
          {
            backgroundColor: surfaceElevatedColor,
            borderColor,
          },
        ]}>
        <View style={styles.previewHeader}>
          <View style={styles.previewApp}>
            <View style={[styles.previewAppIcon, { backgroundColor: brandAccentSoft }]}>
              <IconSymbol name="pawprint.fill" size={14} color={brandAccentColor} />
            </View>
            <ThemedText type="defaultSemiBold" style={styles.previewAppName}>
              {previewAppName}
            </ThemedText>
          </View>
          <ThemedText
            lightColor={textSecondaryColor}
            darkColor={textSecondaryColor}
            style={styles.previewTime}>
            {previewTimeLabel}
          </ThemedText>
        </View>

        <ThemedText type="defaultSemiBold" style={styles.previewTitle}>
          {previewTitle}
        </ThemedText>
        <ThemedText
          lightColor={textSecondaryColor}
          darkColor={textSecondaryColor}
          style={styles.previewBody}>
          {previewMessage}
        </ThemedText>
      </View>

      <View style={styles.benefits}>
        <BenefitRow
          label={benefitDaily}
          brandAccentColor={brandAccentColor}
          brandAccentSoft={brandAccentSoft}
          textSecondaryColor={textSecondaryColor}
        />
        <BenefitRow
          label={benefitSettings}
          brandAccentColor={brandAccentColor}
          brandAccentSoft={brandAccentSoft}
          textSecondaryColor={textSecondaryColor}
        />
      </View>

      <ThemedText
        lightColor={textSecondaryColor}
        darkColor={textSecondaryColor}
        style={styles.hint}>
        {hint}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'stretch',
    gap: Spacing.lg,
    paddingTop: Spacing.sm,
  },
  hero: {
    alignItems: 'center',
  },
  iconHalo: {
    borderRadius: Radius.full,
    borderWidth: 1,
    padding: Spacing.sm,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewCard: {
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
    fontWeight: '600',
  },
  previewTime: {
    ...Typography.caption,
  },
  previewTitle: {
    ...Typography.bodySemiBold,
    marginTop: Spacing.xxs,
  },
  previewBody: {
    ...Typography.body,
    lineHeight: 22,
  },
  benefits: {
    gap: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  benefitIcon: {
    width: 28,
    height: 28,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitLabel: {
    ...Typography.body,
    flex: 1,
    lineHeight: 22,
  },
  hint: {
    ...Typography.body,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: Spacing.md,
  },
});
