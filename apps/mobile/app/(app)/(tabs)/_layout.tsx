import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import type { ComponentProps } from 'react';

import { useTheme } from '@/theme/ThemeProvider';

type FaName = ComponentProps<typeof FontAwesome>['name'];

function makeTabBarIcon(name: FaName) {
  function TabBarIcon({ color, size }: { color: string; size: number }) {
    return <FontAwesome color={color} name={name} size={size} />;
  }
  TabBarIcon.displayName = `TabBarIcon(${name})`;
  return TabBarIcon;
}

export default function AppTabsLayout() {
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.textPrimary,
        headerTitleStyle: { fontWeight: '600' },
        headerShadowVisible: true,
        tabBarActiveTintColor: theme.colors.tabActive,
        tabBarInactiveTintColor: theme.colors.tabInactive,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '500' },
        tabBarStyle: {
          backgroundColor: theme.colors.navBarBg,
          borderTopColor: theme.colors.navBarBorder,
        },
        tabBarItemStyle: { paddingVertical: 4, minWidth: 56 },
      }}
    >
      <Tabs.Screen name="home" options={{ title: 'Home', tabBarIcon: makeTabBarIcon('home') }} />
      <Tabs.Screen name="prompt" options={{ title: 'Prompt', tabBarIcon: makeTabBarIcon('comment') }} />
      <Tabs.Screen name="photos" options={{ title: 'Photos', tabBarIcon: makeTabBarIcon('image') }} />
      <Tabs.Screen
        name="calendar"
        options={{ title: 'Calendar', tabBarIcon: makeTabBarIcon('calendar') }}
      />
      <Tabs.Screen
        name="timeline"
        options={{ title: 'Timeline', tabBarIcon: makeTabBarIcon('list-alt') }}
      />
      <Tabs.Screen name="settings" options={{ title: 'Settings', tabBarIcon: makeTabBarIcon('cog') }} />
    </Tabs>
  );
}
