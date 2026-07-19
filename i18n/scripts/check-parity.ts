import { isAllowedIdenticalKey } from '@/i18n/allowed-identical-keys';
import { de } from '@/i18n/de';
import { en } from '@/i18n/en';
import { tr } from '@/i18n/tr';
import { flattenTranslations } from '@/i18n/scripts/flatten-translations';

type CheckResult = {
  missingInDe: string[];
  missingInEn: string[];
  identicalOutsideAllowlist: string[];
  identicalAllowed: string[];
};

type TurkishCheckResult = {
  missingInTr: string[];
  missingInEn: string[];
  identicalOutsideAllowlist: string[];
  identicalAllowed: string[];
};

function checkTurkishParity(): TurkishCheckResult {
  const enFlat = flattenTranslations(en as unknown as Record<string, unknown>);
  const trFlat = flattenTranslations(tr as unknown as Record<string, unknown>);
  const enKeys = new Set(enFlat.keys());
  const trKeys = new Set(trFlat.keys());

  const identicalOutsideAllowlist: string[] = [];
  const identicalAllowed: string[] = [];

  for (const key of enKeys) {
    if (enFlat.get(key) !== trFlat.get(key)) {
      continue;
    }

    if (isAllowedIdenticalKey(key)) {
      identicalAllowed.push(key);
    } else {
      identicalOutsideAllowlist.push(key);
    }
  }

  return {
    missingInTr: [...enKeys].filter((key) => !trKeys.has(key)).sort(),
    missingInEn: [...trKeys].filter((key) => !enKeys.has(key)).sort(),
    identicalOutsideAllowlist: identicalOutsideAllowlist.sort(),
    identicalAllowed: identicalAllowed.sort(),
  };
}

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
  const turkishResult = checkTurkishParity();

  const hasStructuralMismatch =
    result.missingInDe.length > 0 ||
    result.missingInEn.length > 0 ||
    turkishResult.missingInTr.length > 0 ||
    turkishResult.missingInEn.length > 0;
  const hasUnexpectedIdentical =
    result.identicalOutsideAllowlist.length > 0 ||
    turkishResult.identicalOutsideAllowlist.length > 0;

  console.log('i18n parity check (EN ↔ DE ↔ TR)');

  printSection('Keys in EN missing from DE', result.missingInDe);
  printSection('Keys in DE missing from EN', result.missingInEn);
  printSection('Keys in EN missing from TR', turkishResult.missingInTr);
  printSection('Keys in TR missing from EN', turkishResult.missingInEn);

  printSection(
    'DE values identical to EN (outside allowlist)',
    result.identicalOutsideAllowlist,
    (key) => {
      const enFlat = flattenTranslations(en as unknown as Record<string, unknown>);
      return `"${enFlat.get(key)}"`;
    }
  );
  printSection(
    'TR values identical to EN (outside allowlist)',
    turkishResult.identicalOutsideAllowlist,
    (key) => {
      const enFlat = flattenTranslations(en as unknown as Record<string, unknown>);
      return `"${enFlat.get(key)}"`;
    }
  );

  if (verbose) {
    printSection('DE values identical to EN (allowed)', result.identicalAllowed);
    printSection('TR values identical to EN (allowed)', turkishResult.identicalAllowed);
  } else if (result.identicalAllowed.length > 0) {
    console.log(
      `\n${result.identicalAllowed.length + turkishResult.identicalAllowed.length} identical key(s) on allowlist (use --verbose to list).`
    );
  }

  if (!hasStructuralMismatch && !hasUnexpectedIdentical) {
    console.log('\n✓ EN/DE/TR catalogs are structurally aligned with no unexpected identical strings.');
    process.exit(0);
  }

  if (hasStructuralMismatch) {
    console.error('\n✗ Structural key mismatch between EN, DE, and TR catalogs.');
  }

  if (hasUnexpectedIdentical) {
    const message = strict
      ? '\n✗ German/Turkish catalogs have untranslated strings outside the allowlist.'
      : '\n⚠ German/Turkish catalogs have untranslated strings outside the allowlist (warning only; use --strict to fail).';
    console.error(message);
  }

  if (hasStructuralMismatch || (strict && hasUnexpectedIdentical)) {
    process.exit(1);
  }

  process.exit(0);
}

main();

export { checkParity, checkTurkishParity };
