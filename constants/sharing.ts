import { MAX_FAMILY_SIZE, PLUS_DEV_BYPASS } from '@/constants/subscription';

export const FAMILY_CODE_LENGTH = 6;

export const FAMILY_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/** Owner + members (see `MAX_FAMILY_SIZE` in subscription constants). */
export const MAX_FAMILY_MEMBERS = MAX_FAMILY_SIZE;

export const FAMILY_JOIN_PATH_PREFIX = '/join/';

/** @deprecated Use `PLUS_DEV_BYPASS` from `@/constants/subscription`. */
export const FAMILY_SHARING_DEV_BYPASS = PLUS_DEV_BYPASS;
