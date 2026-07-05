import { View } from 'react-native'
import {
  HomeIcon,
  RectangleStackIcon,
  UserIcon,
} from 'react-native-heroicons/outline'
import { Tabs } from 'expo-router'
// SDK 56: expo-router no longer allows importing @react-navigation/bottom-tabs
// directly; use its vendored re-export instead.
import { BottomTabBar } from 'expo-router/tabs'

import AudioTabIcon from '@/components/AudioTabIcon'
import MainScreenHeader from '@/components/MainScreenHeader'
import MiniPlayerBar from '@/components/MiniPlayerBar'

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
      tabBar={(props) => (
        <View>
          {/* docked above the tab bar on tab screens; pad layout uses the
              overlay instance in Layout instead */}
          {!padLayout.active && <MiniPlayerBar placement='dock' />}
          <BottomTabBar {...props} />
        </View>
      )}
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
      <Tabs.Screen
        name='audio'
        options={{
          tabBarIcon: (props) => <AudioTabIcon {...props} />,
          tabBarLabel: '音频',
          title: '音频资源',
        }}
      />
    </Tabs>
  )
}
