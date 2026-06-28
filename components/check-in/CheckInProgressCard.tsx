import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/Card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Radius, Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTranslation } from '@/hooks/use-translation';
import type { CheckInFormState } from '@/types/check-in';
import { getAbnormalCheckInFieldsFromForm, isCheckInFormComplete } from '@/utils/check-in';

type CheckInProgressCardProps = {
  formValues: CheckInFormState;
  completedCount: number;
  totalCount: number;
};

const RING_SIZE = 72;
const RING_STROKE = 6;

function ProgressRing({
  progress,
  accentColor,
  trackColor,
}: {
  progress: number;
  accentColor: string;
  trackColor: string;
}) {
  const clamped = Math.min(1, Math.max(0, progress));
  const showTop = clamped > 0;
  const showRight = clamped > 0.25;
  const showBottom = clamped > 0.5;
  const showLeft = clamped > 0.75;

  return (
    <View style={[styles.ringOuter, { width: RING_SIZE, height: RING_SIZE }]}>
      <View
        style={[
          styles.ringTrack,
          {
            width: RING_SIZE,
            height: RING_SIZE,
            borderRadius: RING_SIZE / 2,
            borderWidth: RING_STROKE,
            borderColor: trackColor,
          },
        ]}
      />
      {clamped > 0 ? (
        <View
          style={[
            styles.ringProgress,
            {
              width: RING_SIZE,
              height: RING_SIZE,
              borderRadius: RING_SIZE / 2,
              borderWidth: RING_STROKE,
              borderColor: accentColor,
              borderTopColor: showTop ? accentColor : 'transparent',
              borderRightColor: showRight ? accentColor : 'transparent',
              borderBottomColor: showBottom ? accentColor : 'transparent',
              borderLeftColor: showLeft ? accentColor : 'transparent',
            },
          ]}
        />
      ) : null}
    </View>
  );
}

export function CheckInProgressCard({
  formValues,
  completedCount,
  totalCount,
}: CheckInProgressCardProps) {
  const { t } = useTranslation();
  const brandAccentColor = useThemeColor({}, 'brandAccent');
  const brandAccentSoft = useThemeColor({}, 'brandAccentSoft');
  const borderColor = useThemeColor({}, 'border');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');

  const progress = totalCount > 0 ? completedCount / totalCount : 0;
  const percent = Math.round(progress * 100);
  const isComplete = isCheckInFormComplete(formValues);
  const abnormalFields = isComplete ? getAbnormalCheckInFieldsFromForm(formValues) : [];
  const hasAbnormal = abnormalFields.length > 0;

  const headline = isComplete
    ? hasAbnormal
      ? t('checkIn.progressCard.attention')
      : t('checkIn.progressCard.completed')
    : t('checkIn.progressCard.inProgress', { count: completedCount, total: totalCount });

  const subtitle = isComplete
    ? hasAbnormal
      ? t('checkIn.progressCard.attentionSubtitle')
      : t('checkIn.progressCard.completedSubtitle')
    : t('checkIn.progressCard.inProgressSubtitle');

  return (
    <Card style={styles.card}>
      <View style={styles.decorIcon}>
        <IconSymbol name="pawprint.fill" size={80} color={brandAccentSoft} />
      </View>

      <View style={styles.row}>
        <View style={styles.ringContainer}>
          <ProgressRing progress={progress} accentColor={brandAccentColor} trackColor={borderColor} />
          <View style={styles.ringLabel}>
            <ThemedText type="defaultSemiBold" style={styles.ringCount}>
              {completedCount}/{totalCount}
            </ThemedText>
            <ThemedText
              lightColor={textSecondaryColor}
              darkColor={textSecondaryColor}
              style={styles.ringSubtext}>
              {t('checkIn.progressCard.completedLabel')}
            </ThemedText>
          </View>
        </View>

        <View style={styles.textBlock}>
          <ThemedText type="defaultSemiBold" style={styles.headline}>
            {headline}
          </ThemedText>
          <ThemedText
            lightColor={textSecondaryColor}
            darkColor={textSecondaryColor}
            style={styles.subtitle}>
            {subtitle}
          </ThemedText>
        </View>
      </View>

      <View style={styles.barTrack}>
        <View
          style={[
            styles.barFill,
            {
              width: `${percent}%`,
              backgroundColor: brandAccentColor,
            },
          ]}
        />
      </View>
      <ThemedText
        lightColor={textSecondaryColor}
        darkColor={textSecondaryColor}
        style={styles.percentLabel}>
        {t('checkIn.progressCard.percentComplete', { percent })}
      </ThemedText>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
    gap: Spacing.md,
  },
  decorIcon: {
    position: 'absolute',
    right: -8,
    bottom: -8,
    opacity: 0.35,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  ringContainer: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringOuter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringTrack: {
    position: 'absolute',
  },
  ringProgress: {
    position: 'absolute',
    transform: [{ rotate: '-90deg' }],
  },
  ringLabel: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 0,
  },
  ringCount: {
    fontSize: 14,
    lineHeight: 18,
  },
  ringSubtext: {
    ...Typography.caption,
    fontSize: 10,
  },
  textBlock: {
    flex: 1,
    gap: Spacing.xxs,
  },
  headline: {
    ...Typography.subtitle,
  },
  subtitle: {
    ...Typography.body,
  },
  barTrack: {
    height: 4,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: Radius.full,
  },
  percentLabel: {
    ...Typography.caption,
    textAlign: 'right',
  },
});
