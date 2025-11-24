import {
  HomeIcon,
  RectangleStackIcon,
  UserIcon,
} from 'react-native-heroicons/outline'
import { Tabs } from 'expo-router'

import MainScreenHeader from '@/components/MainScreenHeader'

import { usePadLayout } from '@/containers/AppSettingsService'
import { useTheme } from '@/containers/ThemeService'

export default function TabsLayout() {
  const { theme, styles } = useTheme()
  const padLayout = usePadLayout()

  return (
    <Tabs
      initialRouteName='feed'
      backBehavior='initialRoute'
      screenOptions={{
        header: (props) => <MainScreenHeader {...props} />,
        tabBarInactiveTintColor: theme.colors.text_meta,
        tabBarStyle: padLayout.active ? { display: 'none' } : styles.overlay,
      }}
    >
      <Tabs.Screen
        name='nodes'
        options={{
          tabBarIcon: RectangleStackIcon,
          tabBarLabel: '节点',
          title: '节点',
        }}
      />
      <Tabs.Screen
        name='feed'
        options={{
          tabBarIcon: HomeIcon,
          tabBarLabel: '主题',
          title: '主题',
        }}
      />
      <Tabs.Screen
        name='my'
        options={{
          tabBarIcon: UserIcon,
          tabBarLabel: '我的',
          title: '我的',
        }}
      />
    </Tabs>
  )
}
