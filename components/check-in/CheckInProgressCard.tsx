import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Radius, Spacing, Typography } from '@/constants/theme';
import { useCheckInTheme } from '@/hooks/use-check-in-theme';
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
  const checkInTheme = useCheckInTheme();
  const textColor = useThemeColor({}, 'text');
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
    <View style={[styles.card, { backgroundColor: checkInTheme.surface }]}>
      <View style={styles.decorIcon}>
        <IconSymbol name="pawprint.fill" size={80} color={checkInTheme.accent} />
      </View>

      <View style={styles.row}>
        <View style={styles.ringContainer}>
          <ProgressRing
            progress={progress}
            accentColor={checkInTheme.accent}
            trackColor={checkInTheme.progressTrack}
          />
          <View style={styles.ringLabel}>
            <ThemedText type="defaultSemiBold" style={styles.ringCount}>
              {completedCount}/{totalCount}
            </ThemedText>
            <ThemedText style={[styles.ringSubtext, { color: textColor }]}>
              {t('checkIn.progressCard.completedLabel')}
            </ThemedText>
          </View>
        </View>

        <View style={styles.textBlock}>
          <ThemedText type="defaultSemiBold" style={styles.headline} numberOfLines={2}>
            {headline}
          </ThemedText>
          <ThemedText
            lightColor={textSecondaryColor}
            darkColor={textSecondaryColor}
            style={styles.subtitle}
            numberOfLines={2}>
            {subtitle}
          </ThemedText>
        </View>
      </View>

      <View style={styles.barRow}>
        <View style={[styles.barTrack, { backgroundColor: checkInTheme.progressTrack }]}>
          <View
            style={[
              styles.barFill,
              {
                width: `${percent}%`,
                backgroundColor: checkInTheme.accent,
              },
            ]}
          />
        </View>
        <ThemedText style={[styles.percentLabel, { color: textColor }]}>
          {t('checkIn.progressCard.percentComplete', { percent })}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
    gap: Spacing.md,
    borderRadius: Radius.lg,
    padding: Spacing.md,
  },
  decorIcon: {
    position: 'absolute',
    right: 4,
    top: '18%',
    opacity: 0.12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
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
    fontSize: 15,
    lineHeight: 18,
  },
  ringSubtext: {
    ...Typography.caption,
    fontSize: 9,
    lineHeight: 11,
    opacity: 0.85,
  },
  textBlock: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  headline: {
    ...Typography.titleSmall,
  },
  subtitle: {
    ...Typography.caption,
    fontWeight: '400',
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  barTrack: {
    flex: 1,
    height: 6,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: Radius.full,
  },
  percentLabel: {
    ...Typography.caption,
    minWidth: 36,
    textAlign: 'right',
  },
});
