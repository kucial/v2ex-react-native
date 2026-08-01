import { useCallback, useMemo } from 'react'
import { StyleSheet, useWindowDimensions } from 'react-native'
import { TabBar, TabView } from 'react-native-tab-view'

import { useTheme } from '@/containers/ThemeService'
import { PlayerSection, usePlayerUiStore } from '@/stores/playerUi'

import HistoryList from './HistoryList'
import QueueList from './QueueList'
import ResourcesList from './ResourcesList'

const ROUTES: { key: PlayerSection; title: string }[] = [
  { key: 'queue', title: '播放列表' },
  { key: 'resources', title: '资源' },
  { key: 'history', title: '历史' },
]

export default function QueueSection() {
  const { width } = useWindowDimensions()
  const { theme, styles } = useTheme()
  const section = usePlayerUiStore((s) => s.section)
  const setSection = usePlayerUiStore((s) => s.setSection)

  // The store owns the selection so `expand()` can preselect a tab (the pad
  // sidebar opens straight onto 资源 when nothing is playing).
  const index = Math.max(
    0,
    ROUTES.findIndex((route) => route.key === section),
  )

  const renderScene = useCallback(({ route }: { route: { key: string } }) => {
    switch (route.key) {
      case 'queue':
        return <QueueList />
      case 'resources':
        return <ResourcesList />
      case 'history':
        return <HistoryList />
      default:
        return null
    }
  }, [])

  const renderTabBar = useCallback(
    (props: any) => (
      <TabBar
        {...props}
        indicatorStyle={{ backgroundColor: theme.colors.primary }}
        style={[styles.layer1, sectionStyles.tabBar]}
        activeColor={theme.colors.primary}
        inactiveColor={theme.colors.text}
        labelStyle={sectionStyles.label}
      />
    ),
    [theme, styles],
  )

  const navigationState = useMemo(() => ({ index, routes: ROUTES }), [index])

  const handleIndexChange = useCallback(
    (next: number) => {
      setSection(ROUTES[next].key)
    },
    [setSection],
  )

  return (
    <TabView
      navigationState={navigationState}
      renderScene={renderScene}
      renderTabBar={renderTabBar}
      onIndexChange={handleIndexChange}
      initialLayout={{ width }}
      style={sectionStyles.container}
    />
  )
}

const sectionStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBar: {
    elevation: 0,
    shadowOpacity: 0,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
})
