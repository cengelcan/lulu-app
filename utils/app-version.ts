export type AppUpdateKind = 'none' | 'optional' | 'required';

export type AppUpdateDecision = {
  kind: AppUpdateKind;
  currentVersion: string;
  latestVersion: string;
  storeUrl: string;
  reminderIntervalHours: number;
};

type AppReleasePolicy = {
  enabled: boolean;
  latestVersion: string;
  minimumSupportedVersion: string;
  storeUrl: string;
  reminderIntervalHours: number;
};

const VERSION_PATTERN = /^v?(\d+(?:\.\d+){0,3})(?:[-+].*)?$/i;

function parseVersion(version: string): number[] | null {
  const match = VERSION_PATTERN.exec(version.trim());
  if (!match) {
    return null;
  }

  return match[1].split('.').map((part) => Number.parseInt(part, 10));
}

export function compareAppVersions(left: string, right: string): number | null {
  const leftParts = parseVersion(left);
  const rightParts = parseVersion(right);

  if (!leftParts || !rightParts) {
    return null;
  }

  const length = Math.max(leftParts.length, rightParts.length);
  for (let index = 0; index < length; index += 1) {
    const difference = (leftParts[index] ?? 0) - (rightParts[index] ?? 0);
    if (difference !== 0) {
      return difference > 0 ? 1 : -1;
    }
  }

  return 0;
}

export function resolveAppUpdateDecision(
  currentVersion: string,
  policy: AppReleasePolicy
): AppUpdateDecision | null {
  if (!policy.enabled || !policy.storeUrl.startsWith('https://apps.apple.com/')) {
    return null;
  }

  const currentToLatest = compareAppVersions(currentVersion, policy.latestVersion);
  const currentToMinimum = compareAppVersions(currentVersion, policy.minimumSupportedVersion);
  const minimumToLatest = compareAppVersions(
    policy.minimumSupportedVersion,
    policy.latestVersion
  );

  if (
    currentToLatest === null ||
    currentToMinimum === null ||
    minimumToLatest === null ||
    minimumToLatest > 0 ||
    currentToLatest >= 0
  ) {
    return null;
  }

  return {
    kind: currentToMinimum < 0 ? 'required' : 'optional',
    currentVersion,
    latestVersion: policy.latestVersion,
    storeUrl: policy.storeUrl,
    reminderIntervalHours: Math.max(1, policy.reminderIntervalHours),
  };
}

export function shouldShowOptionalUpdate(
  latestVersion: string,
  dismissal: { version: string; dismissedAt: number } | null,
  reminderIntervalHours: number,
  now = Date.now()
): boolean {
  if (!dismissal || dismissal.version !== latestVersion) {
    return true;
  }

  return now - dismissal.dismissedAt >= reminderIntervalHours * 60 * 60 * 1000;
}
