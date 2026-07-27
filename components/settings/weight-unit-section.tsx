import { GroupedSection } from '@/components/pet/GroupedSection';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { Spacing } from '@/constants/theme';
import { useTranslation } from '@/hooks/use-translation';
import type { WeightUnitPreference } from '@/types/experience-preferences';

type WeightUnitSectionProps = {
  preference: WeightUnitPreference;
  onChange: (preference: WeightUnitPreference) => void;
};

export function WeightUnitSection({ preference, onChange }: WeightUnitSectionProps) {
  const { t } = useTranslation();
  const options = [
    { value: 'kg', label: t('settings.weightUnitKg') },
    { value: 'lb', label: t('settings.weightUnitLb') },
  ] as const;

  return (
    <GroupedSection
      title={t('settings.measurement')}
      footer={t('settings.weightUnitFooter')}
      cardStyle={{ padding: Spacing.sm }}>
      <SegmentedControl options={options} value={preference} onChange={onChange} />
    </GroupedSection>
  );
}
