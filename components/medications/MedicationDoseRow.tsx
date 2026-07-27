import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/Button';
import { Radius, Spacing, Typography } from '@/constants/theme';
import { useRegionalFormat } from '@/hooks/use-regional-format';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTranslation } from '@/hooks/use-translation';
import type { MedicationDose, MedicationPlan } from '@/types/medication';
import { formatWallClockTime } from '@/utils/formatters';

export function MedicationDoseRow({ dose, plan, referenceNow, highlighted = false, busy = false, onTake, onSkip, onSnooze }: {
  dose: MedicationDose; plan: MedicationPlan; highlighted?: boolean; busy?: boolean;
  referenceNow: number;
  onTake: () => void; onSkip: () => void; onSnooze: () => void;
}) {
  const { t } = useTranslation();
  const regionalFormat = useRegionalFormat();
  const secondary = useThemeColor({}, 'textSecondary');
  const border = useThemeColor({}, 'border');
  const accent = useThemeColor({}, 'accent');
  const displayStatus = dose.status === 'scheduled' && new Date(dose.scheduledAt).getTime() < referenceNow
    ? 'missed' : dose.status;
  const isActionable = dose.status === 'scheduled' || dose.status === 'snoozed';

  return (
    <View style={[styles.root, highlighted && { borderColor: accent, borderWidth: 2 }]}>
      <View style={styles.header}>
        <View style={styles.copy}>
          <ThemedText type="defaultSemiBold" selectable>{plan.name}</ThemedText>
          <ThemedText lightColor={secondary} darkColor={secondary} style={styles.detail} selectable>
            {plan.dosage} {plan.unit} · {formatWallClockTime(dose.localTime, regionalFormat)}
          </ThemedText>
        </View>
        <View style={[styles.badge, { borderColor: border }]}>
          <ThemedText style={styles.badgeText}>{t(`medications.status.${displayStatus}`)}</ThemedText>
        </View>
      </View>
      {isActionable ? (
        <View style={styles.actions}>
          <Button title={t('medications.actions.take')} disabled={busy} onPress={onTake} style={styles.primaryAction} />
          <Button title={t('medications.actions.snooze')} variant="secondary" disabled={busy}
            onPress={onSnooze} style={styles.secondaryAction} />
          <Button title={t('medications.actions.skip')} variant="ghost" disabled={busy}
            onPress={onSkip} style={styles.secondaryAction} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { padding: Spacing.md, gap: Spacing.md, borderRadius: Radius.lg },
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm },
  copy: { flex: 1, minWidth: 0, gap: 2 },
  detail: { ...Typography.caption, fontVariant: ['tabular-nums'] },
  badge: { borderWidth: StyleSheet.hairlineWidth, borderRadius: Radius.pill, paddingHorizontal: Spacing.sm, paddingVertical: Spacing.xxs },
  badgeText: { ...Typography.caption },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  primaryAction: { flexGrow: 1, minWidth: 100 },
  secondaryAction: { flexGrow: 1, minWidth: 110 },
});
