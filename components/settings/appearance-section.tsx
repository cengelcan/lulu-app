import { GroupedSection } from '@/components/pet/GroupedSection';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { Spacing } from '@/constants/theme';
import { useTranslation } from '@/hooks/use-translation';
import type { ThemePreference } from '@/types/experience-preferences';

type AppearanceSectionProps = {
  preference: ThemePreference;
  onChange: (preference: ThemePreference) => void;
};

export function AppearanceSection({ preference, onChange }: AppearanceSectionProps) {
  const { t } = useTranslation();
  const options = [
    { value: 'system', label: t('settings.appearanceSystem') },
    { value: 'light', label: t('settings.appearanceLight') },
    { value: 'dark', label: t('settings.appearanceDark') },
  ] as const;

  return (
    <GroupedSection
      title={t('settings.appearance')}
      cardStyle={{ padding: Spacing.sm }}>
      <SegmentedControl options={options} value={preference} onChange={onChange} />
    </GroupedSection>
  );
}
