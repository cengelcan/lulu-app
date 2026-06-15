import { Tabs } from 'expo-router';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
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
      <Tabs.Screen
        name="home"
        options={{
          title: t('tabs.home'),
          tabBarIcon: ({ color }) => <IconSymbol name="house.fill" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="my-pets"
        options={{
          title: t('tabs.myPets'),
          tabBarIcon: ({ color }) => <IconSymbol name="pawprint.fill" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('tabs.profile'),
          tabBarIcon: ({ color }) => <IconSymbol name="person.fill" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
