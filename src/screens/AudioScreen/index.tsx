import { useCallback, useMemo, useState } from 'react'
import { useWindowDimensions, View } from 'react-native'
import { TabBar, TabView } from 'react-native-tab-view'

import NavigationHeader from '@/components/NavigationHeader'

import { useTheme } from '@/containers/ThemeService'

import { HistoryTab } from './HistoryTab'
import { ResourcesTab } from './ResourcesTab'

const routes = [
  { key: 'resources', title: '所有资源' },
  { key: 'history', title: '播放历史' },
]

export default function AudioScreen() {
  const { width } = useWindowDimensions()
  const { theme, styles } = useTheme()
  const [index, setIndex] = useState(0)

  const renderScene = useCallback(({ route }: { route: { key: string } }) => {
    switch (route.key) {
      case 'resources':
        return <ResourcesTab />
      case 'history':
        return <HistoryTab />
      default:
        return null
    }
  }, [])

  const renderTabBar = useCallback(
    (props: any) => (
      <TabBar
        {...props}
        indicatorStyle={{ backgroundColor: theme.colors.primary }}
        style={[styles.layer1]}
        activeColor={theme.colors.primary}
        inactiveColor={theme.colors.text}
        labelStyle={{ fontSize: 14, fontWeight: '500' }}
      />
    ),
    [theme, styles],
  )

  const navigationState = useMemo(() => ({ index, routes }), [index])

  return (
    <View className='flex-1'>
      <NavigationHeader canGoBack title='音频资源' shadow={false} />
      <TabView
        navigationState={navigationState}
        renderScene={renderScene}
        renderTabBar={renderTabBar}
        onIndexChange={setIndex}
        initialLayout={{ width }}
      />
    </View>
  )
}
