export type PaywallLayout = {
  stackFeatures: boolean;
  stackPlans: boolean;
  stackTrustBadges: boolean;
};

export function getPaywallLayout(width: number, fontScale: number): PaywallLayout {
  return {
    stackFeatures: width < 360 || fontScale >= 1.4,
    stackPlans: width < 390 || fontScale >= 1.3,
    stackTrustBadges: width < 340 || fontScale >= 1.4,
  };
}
