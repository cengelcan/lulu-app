import type { IconSymbolName } from '@/components/ui/icon-symbol';

export type MainTabDefinition = {
  name: 'home' | 'care' | 'my-pets' | 'profile';
  labelKey: 'tabs.home' | 'tabs.care' | 'tabs.myPets' | 'tabs.profile';
  icon: IconSymbolName;
};

export const MAIN_TABS: readonly MainTabDefinition[] = [
  { name: 'home', labelKey: 'tabs.home', icon: 'house.fill' },
  { name: 'care', labelKey: 'tabs.care', icon: 'cross.case.fill' },
  { name: 'my-pets', labelKey: 'tabs.myPets', icon: 'pawprint.fill' },
  { name: 'profile', labelKey: 'tabs.profile', icon: 'person.fill' },
] as const;
