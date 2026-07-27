import type { CheckIn } from '@/types/check-in';

export function getLatestCheckIn(checkIns: CheckIn[]): CheckIn | null {
  if (checkIns.length === 0) {
    return null;
  }

  return [...checkIns].sort((a, b) => {
    const dateCompare = b.date.localeCompare(a.date);
    if (dateCompare !== 0) {
      return dateCompare;
    }

    return b.createdAt.localeCompare(a.createdAt);
  })[0];
}
