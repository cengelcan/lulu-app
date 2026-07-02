import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/Button';
import { IconSymbol, type IconSymbolName } from '@/components/ui/icon-symbol';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';
import { useTranslation } from '@/hooks/use-translation';
import { useThemeColor } from '@/hooks/use-theme-color';

type ComparisonFreeValue = 'dash' | 'limited' | 'basic' | 'one';
type ComparisonPlusValue = 'check' | 'all';

type ComparisonRow = {
  titleKey: string;
  free: ComparisonFreeValue;
  plus: ComparisonPlusValue;
};

type BenefitConfig = {
  icon: IconSymbolName;
  titleKey: string;
  descriptionKey: string;
};

type ValueStep = {
  icon: IconSymbolName;
  titleKey: string;
  descriptionKey: string;
};

const VALUE_STEPS: ValueStep[] = [
  {
    icon: 'chart.line.uptrend.xyaxis',
    titleKey: 'paywall.stepOneTitle',
    descriptionKey: 'paywall.stepOneDescription',
  },
  {
    icon: 'pawprint.fill',
    titleKey: 'paywall.stepTwoTitle',
    descriptionKey: 'paywall.stepTwoDescription',
  },
  {
    icon: 'sparkles',
    titleKey: 'paywall.stepThreeTitle',
    descriptionKey: 'paywall.stepThreeDescription',
  },
];

const COMPARISON_ROWS: ComparisonRow[] = [
  { titleKey: 'paywall.advancedReportsTitle', free: 'dash', plus: 'check' },
  { titleKey: 'paywall.longerHistoryTitle', free: 'limited', plus: 'check' },
  { titleKey: 'paywall.multiplePetsTitle', free: 'one', plus: 'all' },
  { titleKey: 'paywall.familySharingTitle', free: 'dash', plus: 'check' },
  { titleKey: 'paywall.smartRemindersTitle', free: 'basic', plus: 'check' },
  { titleKey: 'paywall.trendsTitle', free: 'dash', plus: 'check' },
];

const BENEFITS: BenefitConfig[] = [
  {
    icon: 'doc.text.fill',
    titleKey: 'paywall.advancedReportsTitle',
    descriptionKey: 'paywall.advancedReportsDescription',
  },
  {
    icon: 'clock.fill',
    titleKey: 'paywall.longerHistoryTitle',
    descriptionKey: 'paywall.longerHistoryDescription',
  },
  {
    icon: 'pawprint.fill',
    titleKey: 'paywall.multiplePetsTitle',
    descriptionKey: 'paywall.multiplePetsDescription',
  },
  {
    icon: 'person.fill',
    titleKey: 'paywall.familySharingTitle',
    descriptionKey: 'paywall.familySharingDescription',
  },
  {
    icon: 'bell.fill',
    titleKey: 'paywall.smartRemindersTitle',
    descriptionKey: 'paywall.smartRemindersDescription',
  },
  {
    icon: 'chart.line.uptrend.xyaxis',
    titleKey: 'paywall.trendsTitle',
    descriptionKey: 'paywall.trendsDescription',
  },
];

type LuluPlusPaywallProps = {
  visible: boolean;
  onDismiss: () => void;
};

type ValueStepRowProps = {
  icon: IconSymbolName;
  title: string;
  description: string;
  isLast: boolean;
  brandAccentColor: string;
  textSecondaryColor: string;
};

function ValueStepRow({
  icon,
  title,
  description,
  isLast,
  brandAccentColor,
  textSecondaryColor,
}: ValueStepRowProps) {
  return (
    <View style={styles.stepRow}>
      <View style={styles.stepRail}>
        <View style={[styles.stepIconWrap, { backgroundColor: Palette.brandAccentSoft }]}>
          <IconSymbol name={icon} size={18} color={brandAccentColor} />
        </View>
        {!isLast ? <View style={[styles.stepLine, { backgroundColor: Palette.brandAccentBorder }]} /> : null}
      </View>
      <View style={styles.stepCopy}>
        <ThemedText type="defaultSemiBold">{title}</ThemedText>
        <ThemedText
          lightColor={textSecondaryColor}
          darkColor={textSecondaryColor}
          style={styles.stepDescription}>
          {description}
        </ThemedText>
      </View>
    </View>
  );
}

type ComparisonCellProps = {
  children: React.ReactNode;
  align?: 'start' | 'center';
};

function ComparisonCell({ children, align = 'center' }: ComparisonCellProps) {
  return (
    <View style={[styles.comparisonCell, align === 'start' && styles.comparisonCellStart]}>
      {children}
    </View>
  );
}

type ComparisonTableProps = {
  rows: ComparisonRow[];
  freeLabel: (value: ComparisonFreeValue) => string;
  plusLabel: (value: ComparisonPlusValue) => string;
  comparisonTitle: string;
  freeColumn: string;
  plusColumn: string;
  brandAccentColor: string;
  surfaceSoftColor: string;
  textSecondaryColor: string;
  t: (key: string) => string;
};

function ComparisonTable({
  rows,
  freeLabel,
  plusLabel,
  comparisonTitle,
  freeColumn,
  plusColumn,
  brandAccentColor,
  surfaceSoftColor,
  textSecondaryColor,
  t,
}: ComparisonTableProps) {
  return (
    <View style={styles.comparisonTable}>
      <View style={[styles.comparisonHeader, { backgroundColor: Palette.brandAccentSoft }]}>
        <ComparisonCell align="start">
          <ThemedText type="defaultSemiBold">{comparisonTitle}</ThemedText>
        </ComparisonCell>
        <ComparisonCell>
          <ThemedText
            lightColor={textSecondaryColor}
            darkColor={textSecondaryColor}
            type="defaultSemiBold">
            {freeColumn}
          </ThemedText>
        </ComparisonCell>
        <ComparisonCell>
          <ThemedText type="defaultSemiBold" style={{ color: brandAccentColor }}>
            {plusColumn}
          </ThemedText>
        </ComparisonCell>
      </View>

      {rows.map((row, index) => (
        <View
          key={row.titleKey}
          style={[
            styles.comparisonRow,
            index % 2 === 1 ? { backgroundColor: surfaceSoftColor } : undefined,
          ]}>
          <ComparisonCell align="start">
            <ThemedText style={styles.comparisonFeature}>{t(row.titleKey)}</ThemedText>
          </ComparisonCell>
          <ComparisonCell>
            <Text
              allowFontScaling
              maxFontSizeMultiplier={Typography.body.maxFontSizeMultiplier}
              style={[styles.comparisonValue, { color: textSecondaryColor }]}>
              {freeLabel(row.free)}
            </Text>
          </ComparisonCell>
          <ComparisonCell>
            {row.plus === 'check' ? (
              <View style={[styles.checkBadge, { backgroundColor: Palette.brandAccentSoft }]}>
                <IconSymbol name="checkmark" size={14} color={brandAccentColor} />
              </View>
            ) : (
              <Text
                allowFontScaling
                maxFontSizeMultiplier={Typography.body.maxFontSizeMultiplier}
                style={[styles.comparisonValue, styles.comparisonValuePlus, { color: brandAccentColor }]}>
                {plusLabel(row.plus)}
              </Text>
            )}
          </ComparisonCell>
        </View>
      ))}
    </View>
  );
}

type BenefitCardProps = {
  icon: IconSymbolName;
  title: string;
  description: string;
  surfaceSoftColor: string;
  brandAccentColor: string;
  textSecondaryColor: string;
};

function BenefitCard({
  icon,
  title,
  description,
  surfaceSoftColor,
  brandAccentColor,
  textSecondaryColor,
}: BenefitCardProps) {
  return (
    <View style={[styles.benefitCard, { backgroundColor: surfaceSoftColor }]}>
      <View style={[styles.benefitIconWrap, { backgroundColor: Palette.brandAccentSoft }]}>
        <IconSymbol name={icon} size={20} color={brandAccentColor} />
      </View>
      <View style={styles.benefitCopy}>
        <ThemedText type="defaultSemiBold">{title}</ThemedText>
        <ThemedText
          lightColor={textSecondaryColor}
          darkColor={textSecondaryColor}
          style={styles.benefitDescription}>
          {description}
        </ThemedText>
      </View>
    </View>
  );
}

export function LuluPlusPaywall({ visible, onDismiss }: LuluPlusPaywallProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const backgroundColor = useThemeColor({}, 'background');
  const surfaceSoftColor = useThemeColor({}, 'surfaceSoft');
  const brandAccentColor = useThemeColor({}, 'brandAccent');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const borderColor = useThemeColor({}, 'border');

  const handleDismiss = () => {
    if (process.env.EXPO_OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onDismiss();
  };

  const handlePrimaryPress = () => {
    if (process.env.EXPO_OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    Alert.alert(t('paywall.comingSoonAlertTitle'), t('paywall.comingSoonAlertMessage'), [
      { text: t('common.ok'), style: 'default' },
    ]);
  };

  const freeLabel = (value: ComparisonFreeValue) => {
    switch (value) {
      case 'limited':
        return t('paywall.freeLimited');
      case 'basic':
        return t('paywall.freeBasic');
      case 'one':
        return t('paywall.freePetLimit');
      default:
        return t('paywall.notIncluded');
    }
  };

  const plusLabel = (value: ComparisonPlusValue) => {
    if (value === 'all') {
      return t('paywall.plusPetLimit');
    }
    return '';
  };

  return (
    <Modal animationType="slide" visible={visible} onRequestClose={handleDismiss}>
      <SafeAreaView style={[styles.screen, { backgroundColor }]} edges={['top']}>
        <View style={styles.topBar}>
          <View style={styles.topBarSpacer} />
          <Pressable
            accessibilityLabel={t('common.dismissDialog')}
            accessibilityRole="button"
            hitSlop={12}
            onPress={handleDismiss}
            style={styles.closeButton}>
            <IconSymbol name="xmark.circle" size={28} color={textSecondaryColor} />
          </Pressable>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator
          keyboardShouldPersistTaps="handled">
          <View style={styles.hero}>
            <View style={[styles.badge, { backgroundColor: Palette.brandAccentSoft }]}>
              <Text
                allowFontScaling
                maxFontSizeMultiplier={Typography.caption.maxFontSizeMultiplier}
                style={[styles.badgeLabel, { color: brandAccentColor }]}>
                {t('paywall.badge')}
              </Text>
            </View>

            <ThemedText type="title" style={styles.headline}>
              {t('paywall.headline')}
            </ThemedText>

            <ThemedText
              lightColor={textSecondaryColor}
              darkColor={textSecondaryColor}
              style={styles.subtitle}>
              {t('paywall.subtitle')}
            </ThemedText>
          </View>

          <View style={styles.stepsSection}>
            {VALUE_STEPS.map((step, index) => (
              <ValueStepRow
                key={step.titleKey}
                icon={step.icon}
                title={t(step.titleKey)}
                description={t(step.descriptionKey)}
                isLast={index === VALUE_STEPS.length - 1}
                brandAccentColor={brandAccentColor}
                textSecondaryColor={textSecondaryColor}
              />
            ))}
          </View>

          <ComparisonTable
            rows={COMPARISON_ROWS}
            freeLabel={freeLabel}
            plusLabel={plusLabel}
            comparisonTitle={t('paywall.comparisonTitle')}
            freeColumn={t('paywall.freeColumn')}
            plusColumn={t('paywall.plusColumn')}
            brandAccentColor={brandAccentColor}
            surfaceSoftColor={surfaceSoftColor}
            textSecondaryColor={textSecondaryColor}
            t={t}
          />

          <View style={styles.highlightsSection}>
            <ThemedText type="subtitle" style={styles.highlightsTitle}>
              {t('paywall.highlightTitle')}
            </ThemedText>

            {BENEFITS.map((benefit) => (
              <BenefitCard
                key={benefit.titleKey}
                icon={benefit.icon}
                title={t(benefit.titleKey)}
                description={t(benefit.descriptionKey)}
                surfaceSoftColor={surfaceSoftColor}
                brandAccentColor={brandAccentColor}
                textSecondaryColor={textSecondaryColor}
              />
            ))}
          </View>

          <LinearGradient
            colors={[Palette.brandAccentSoft, 'rgba(169,152,214,0.04)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.reassuranceCard}>
            <IconSymbol name="crown.fill" size={24} color={brandAccentColor} />
            <ThemedText type="defaultSemiBold" style={styles.reassuranceTitle}>
              {t('paywall.reassuranceTitle')}
            </ThemedText>
            <ThemedText
              lightColor={textSecondaryColor}
              darkColor={textSecondaryColor}
              style={styles.reassuranceBody}>
              {t('paywall.reassuranceBody')}
            </ThemedText>
          </LinearGradient>

          <Text
            allowFontScaling
            maxFontSizeMultiplier={Typography.caption.maxFontSizeMultiplier}
            style={[styles.footerNote, { color: textSecondaryColor }]}>
            {t('paywall.footerNote')}
          </Text>
        </ScrollView>

        <View
          style={[
            styles.footer,
            {
              borderTopColor: borderColor,
              paddingBottom: Math.max(insets.bottom, Spacing.md),
              backgroundColor,
            },
          ]}>
          <Button title={t('paywall.primaryButton')} onPress={handlePrimaryPress} />
          <Button title={t('paywall.secondaryButton')} variant="ghost" onPress={handleDismiss} />
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xs,
  },
  topBarSpacer: {
    flex: 1,
  },
  closeButton: {
    padding: Spacing.xxs,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    gap: Spacing.lg,
  },
  hero: {
    alignItems: 'center',
    gap: Spacing.sm,
    paddingTop: Spacing.xs,
  },
  badge: {
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xxs,
  },
  badgeLabel: {
    ...Typography.caption,
    fontWeight: '600',
  },
  headline: {
    textAlign: 'center',
  },
  subtitle: {
    ...Typography.body,
    textAlign: 'center',
    maxWidth: 320,
  },
  stepsSection: {
    gap: Spacing.xs,
    paddingVertical: Spacing.xs,
  },
  stepRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  stepRail: {
    alignItems: 'center',
    width: 36,
  },
  stepIconWrap: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepLine: {
    flex: 1,
    width: 2,
    marginTop: Spacing.xxs,
    marginBottom: Spacing.xxs,
    borderRadius: Radius.pill,
  },
  stepCopy: {
    flex: 1,
    gap: Spacing.xxs,
    paddingBottom: Spacing.sm,
  },
  stepDescription: {
    ...Typography.body,
  },
  comparisonTable: {
    borderRadius: Radius.lg,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Palette.brandAccentBorder,
  },
  comparisonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
  },
  comparisonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    minHeight: 48,
  },
  comparisonCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  comparisonCellStart: {
    alignItems: 'flex-start',
    flex: 1.6,
  },
  comparisonFeature: {
    ...Typography.body,
    paddingRight: Spacing.xs,
  },
  comparisonValue: {
    ...Typography.body,
    textAlign: 'center',
  },
  comparisonValuePlus: {
    fontWeight: '600',
  },
  checkBadge: {
    width: 28,
    height: 28,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  highlightsSection: {
    gap: Spacing.sm,
  },
  highlightsTitle: {
    textAlign: 'center',
  },
  benefitCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    borderRadius: Radius.lg,
    padding: Spacing.md,
  },
  benefitIconWrap: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitCopy: {
    flex: 1,
    gap: Spacing.xxs,
  },
  benefitDescription: {
    ...Typography.body,
  },
  reassuranceCard: {
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    gap: Spacing.xs,
  },
  reassuranceTitle: {
    textAlign: 'center',
  },
  reassuranceBody: {
    ...Typography.body,
    textAlign: 'center',
  },
  footerNote: {
    ...Typography.caption,
    textAlign: 'center',
    marginTop: -Spacing.xs,
  },
  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    gap: Spacing.xs,
  },
});
