import { Tabs } from 'expo-router';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { MAIN_TABS } from '@/constants/main-tabs';
import { useTranslation } from '@/hooks/use-translation';
import { useThemeColor } from '@/hooks/use-theme-color';

export default function TabLayout() {
  const { t } = useTranslation();
  const tabBarActiveTintColor = useThemeColor({}, 'tabIconSelected');
  const tabBarInactiveTintColor = useThemeColor({}, 'tabIconDefault');
  const backgroundColor = useThemeColor({}, 'background');
  const borderColor = useThemeColor({}, 'border');

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor,
        tabBarInactiveTintColor,
        tabBarButton: (props) => <HapticTab {...props} />,
        tabBarStyle: {
          backgroundColor,
          borderTopColor: borderColor,
        },
      }}>
      {MAIN_TABS.map((tab) => {
        const label = t(tab.labelKey);

        return (
          <Tabs.Screen
            key={tab.name}
            name={tab.name}
            options={{
              title: label,
              tabBarAccessibilityLabel: label,
              tabBarIcon: ({ color }) => <IconSymbol name={tab.icon} size={24} color={color} />,
            }}
          />
        );
      })}
      <Tabs.Screen
        name="family"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
