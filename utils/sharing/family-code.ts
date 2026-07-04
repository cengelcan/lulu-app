import { FAMILY_CODE_ALPHABET, FAMILY_CODE_LENGTH } from '@/constants/sharing';

export function generateFamilyCode(): string {
  let code = '';

  for (let index = 0; index < FAMILY_CODE_LENGTH; index += 1) {
    const charIndex = Math.floor(Math.random() * FAMILY_CODE_ALPHABET.length);
    code += FAMILY_CODE_ALPHABET[charIndex];
  }

  return code;
}

export function normalizeFamilyCode(input: string): string {
  return input.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
}

export function formatFamilyCode(code: string): string {
  const normalized = normalizeFamilyCode(code);

  if (normalized.length <= 3) {
    return normalized;
  }

  return `${normalized.slice(0, 3)}-${normalized.slice(3)}`;
}

export function buildFamilyJoinUrl(code: string): string {
  const normalized = normalizeFamilyCode(code);
  return `lulu://join/${normalized}`;
}

export function parseFamilyCodeFromUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    const pathParts = parsed.pathname.split('/').filter(Boolean);
    const joinIndex = pathParts.findIndex((part) => part.toLowerCase() === 'join');

    if (joinIndex >= 0 && pathParts[joinIndex + 1]) {
      return normalizeFamilyCode(pathParts[joinIndex + 1]);
    }

    if (parsed.hostname === 'join' && pathParts[0]) {
      return normalizeFamilyCode(pathParts[0]);
    }
  } catch {
    const match = url.match(/join\/([A-Za-z0-9-]+)/i);

    if (match?.[1]) {
      return normalizeFamilyCode(match[1]);
    }
  }

  return null;
}
