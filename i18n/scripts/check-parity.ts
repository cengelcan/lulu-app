import { isAllowedIdenticalKey } from '@/i18n/allowed-identical-keys';
import { de } from '@/i18n/de';
import { en } from '@/i18n/en';
import { flattenTranslations } from '@/i18n/scripts/flatten-translations';

type CheckResult = {
  missingInDe: string[];
  missingInEn: string[];
  identicalOutsideAllowlist: string[];
  identicalAllowed: string[];
};

function checkParity(): CheckResult {
  const enFlat = flattenTranslations(en as unknown as Record<string, unknown>);
  const deFlat = flattenTranslations(de as unknown as Record<string, unknown>);

  const enKeys = new Set(enFlat.keys());
  const deKeys = new Set(deFlat.keys());

  const missingInDe = [...enKeys].filter((key) => !deKeys.has(key)).sort();
  const missingInEn = [...deKeys].filter((key) => !enKeys.has(key)).sort();

  const identicalOutsideAllowlist: string[] = [];
  const identicalAllowed: string[] = [];

  for (const key of enKeys) {
    if (!deKeys.has(key)) {
      continue;
    }

    const enValue = enFlat.get(key);
    const deValue = deFlat.get(key);

    if (enValue !== deValue) {
      continue;
    }

    if (isAllowedIdenticalKey(key)) {
      identicalAllowed.push(key);
    } else {
      identicalOutsideAllowlist.push(key);
    }
  }

  return {
    missingInDe,
    missingInEn,
    identicalOutsideAllowlist: identicalOutsideAllowlist.sort(),
    identicalAllowed: identicalAllowed.sort(),
  };
}

function printSection(title: string, keys: string[], detail?: (key: string) => string): void {
  if (keys.length === 0) {
    return;
  }

  console.log(`\n${title} (${keys.length}):`);
  for (const key of keys) {
    const suffix = detail ? ` — ${detail(key)}` : '';
    console.log(`  - ${key}${suffix}`);
  }
}

function main(): void {
  const strict = process.argv.includes('--strict');
  const verbose = process.argv.includes('--verbose');
  const result = checkParity();

  const hasStructuralMismatch = result.missingInDe.length > 0 || result.missingInEn.length > 0;
  const hasUnexpectedIdentical = result.identicalOutsideAllowlist.length > 0;

  console.log('i18n parity check (EN ↔ DE)');

  printSection('Keys in EN missing from DE', result.missingInDe);
  printSection('Keys in DE missing from EN', result.missingInEn);

  printSection(
    'DE values identical to EN (outside allowlist)',
    result.identicalOutsideAllowlist,
    (key) => {
      const enFlat = flattenTranslations(en as unknown as Record<string, unknown>);
      return `"${enFlat.get(key)}"`;
    }
  );

  if (verbose) {
    printSection('DE values identical to EN (allowed)', result.identicalAllowed);
  } else if (result.identicalAllowed.length > 0) {
    console.log(
      `\n${result.identicalAllowed.length} identical key(s) on allowlist (use --verbose to list).`
    );
  }

  if (!hasStructuralMismatch && !hasUnexpectedIdentical) {
    console.log('\n✓ EN/DE catalogs are structurally aligned with no unexpected identical strings.');
    process.exit(0);
  }

  if (hasStructuralMismatch) {
    console.error('\n✗ Structural key mismatch between EN and DE catalogs.');
  }

  if (hasUnexpectedIdentical) {
    const message = strict
      ? '\n✗ German catalog has untranslated strings outside the allowlist.'
      : '\n⚠ German catalog has untranslated strings outside the allowlist (warning only; use --strict to fail).';
    console.error(message);
  }

  if (hasStructuralMismatch || (strict && hasUnexpectedIdentical)) {
    process.exit(1);
  }

  process.exit(0);
}

main();

export { checkParity };
