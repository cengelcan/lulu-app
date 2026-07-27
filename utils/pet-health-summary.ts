import type { HealthCondition } from '@/types/pet';

export const DEFAULT_VISIBLE_HEALTH_CONDITION_COUNT = 3;

export function getActiveHealthConditions(
  conditions: HealthCondition[]
): HealthCondition[] {
  return conditions.filter((condition) => condition !== 'none');
}

export function buildHealthConditionSummary(
  conditions: HealthCondition[],
  expanded: boolean,
  visibleCount = DEFAULT_VISIBLE_HEALTH_CONDITION_COUNT
): { visible: HealthCondition[]; hiddenCount: number } {
  const active = getActiveHealthConditions(conditions);

  if (expanded || active.length <= visibleCount) {
    return { visible: active, hiddenCount: 0 };
  }

  return {
    visible: active.slice(0, visibleCount),
    hiddenCount: active.length - visibleCount,
  };
}
