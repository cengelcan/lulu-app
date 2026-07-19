export type FamilyNavigationView =
  | 'active_owner'
  | 'active_member'
  | 'setup'
  | 'upsell';

type ResolveFamilyNavigationViewInput = {
  hasOwnerGroup: boolean;
  hasMemberGroup: boolean;
  canUseFamilySharing: boolean;
};

export function resolveFamilyNavigationView({
  hasOwnerGroup,
  hasMemberGroup,
  canUseFamilySharing,
}: ResolveFamilyNavigationViewInput): FamilyNavigationView {
  if (hasOwnerGroup) {
    return 'active_owner';
  }

  if (hasMemberGroup) {
    return 'active_member';
  }

  return canUseFamilySharing ? 'setup' : 'upsell';
}

export function canAccessFamilyOwnerRoutes(view: FamilyNavigationView): boolean {
  return view === 'active_owner';
}
