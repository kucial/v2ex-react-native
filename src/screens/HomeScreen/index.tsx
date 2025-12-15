import { useEffect, useMemo, useRef, useState } from 'react'
import { Pressable, Text, useWindowDimensions, View } from 'react-native'
import { useSharedValue } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { TabBar, TabView } from 'react-native-tab-view'
import { useLocalSearchParams, useNavigation, usePathname } from 'expo-router'

import HomeTopicList from '@/components/HomeTopicList'
import NodeTopicList from '@/components/NodeTopicList'
import PlanetFeedList from '@/components/PlanetFeedList'
import HomeSkeleton from '@/components/Skeleton/HomeSkeleton'
import XnaTopicList from '@/components/XnaTopicList'

import { APP_SIDEBAR_SIZE } from '@/constants'
import { useAppSettings, usePadLayout } from '@/containers/AppSettingsService'
import { useTheme } from '@/containers/ThemeService'
import { useTabOptions } from '@/hooks'
import { useCachedState } from '@/utils/hooks'

import HomeDataPrefetch from './HomeDataPrefetch'

const REFRESH_IDLE_RESET_TIMEOUT = 1000
const CACHE_KEY = '$app$/home-screen-index'

interface RefreshableView {
  scrollToRefresh(): void
}

export default function HomeScreen(props) {
  const {
    data: { homeTabs },
    initHomeTabs,
  } = useAppSettings()
  const { width, height } = useWindowDimensions()
  const { tab: queryTab } = useLocalSearchParams<{ tab: string }>()
  const insets = useSafeAreaInsets()
  const padLayout = usePadLayout()
  const [error, setError] = useState<Error>(null)
  const { theme, styles } = useTheme()
  const routes = useMemo(() => {
    if (!homeTabs) {
      return null
    }
    return homeTabs
      .map((tab) => {
        if (tab.disabled) {
          return
        }
        const key = `home-${tab.type}-${tab.value}`
        return {
          key,
          title: tab.label,
          tab: tab,
        }
      })
      .filter(Boolean)
  }, [homeTabs])

  const [index, setIndex] = useCachedState<number>(CACHE_KEY, 0)

  useEffect(() => {
    if (queryTab && homeTabs) {
      const queryIndex = homeTabs.findIndex(
        (val) => val.type === 'home' && val.value === queryTab,
      )
      if (queryIndex > -1) {
        setIndex(queryIndex)
      }
    }
  }, [])

  const pathname = usePathname()
  const navigation = useNavigation()

  const normalizedIndex = Math.min(index, routes ? routes.length - 1 : 0)

  const currentListRef = useRef<RefreshableView>(null)
  const tabIdleForRefresh = useRef<string>(null)
  const tabIdleResetTimer = useRef<NodeJS.Timeout>(null)

  const scrollY = useSharedValue(0)

  const viewWidth =
    padLayout.active && padLayout.orientation === 'PORTRAIT'
      ? width - APP_SIDEBAR_SIZE - insets.left - insets.right
      : width - insets.left - insets.right

  const { renderScene, renderTabBar } = useMemo(() => {
    if (!homeTabs) {
      return {}
    }

    return {
      renderScene: ({ route }) => {
        const { tab } = route
        const isFocused = pathname === '/feed'
        const isActive = isFocused && route.key === routes[normalizedIndex].key
        switch (tab.type) {
          case 'node':
            return (
              <NodeTopicList
                key={`${tab.type}-${tab.value}`}
                isFocused={isActive}
                currentListRef={isActive && currentListRef}
                name={tab.value}
                scrollY={scrollY}
              />
            )
          case 'home':
            return (
              <HomeTopicList
                key={`${tab.type}-${tab.value}`}
                isFocused={isActive}
                currentListRef={isActive && currentListRef}
                tab={tab.value}
              />
            )
          case 'xna':
            return (
              <XnaTopicList
                key='xna'
                isFocused={isActive}
                currentListRef={isActive && currentListRef}
              />
            )
          case 'planet':
            return (
              <PlanetFeedList
                key='planet'
                isFocused={isActive}
                currentListRef={isActive && currentListRef}
              />
            )
          default:
            return (
              <View>
                <Text>TO_HANDLE: {tab.type}</Text>
              </View>
            )
        }
      },
      renderTabBar: (props) => {
        return (
          <TabBar
            {...props}
            scrollEnabled
            pressColor={theme.colors.bg_layer3}
            indicatorStyle={{
              backgroundColor: theme.colors.primary,
              height: 2,
            }}
            style={styles.layer1}
            tabStyle={{
              flexShrink: 0,
              width: 'auto',
              minWidth: 56,
              height: 42,
              paddingTop: 3,
            }}
            contentContainerStyle={{
              display: 'flex',
              flexDirection: 'row',
              minWidth: viewWidth,
              overflow: 'scroll',
            }}
            activeColor={theme.colors.primary}
            inactiveColor={theme.colors.text}
            onTabPress={({ route }) => {
              const currentRoute = routes[normalizedIndex]
              if (currentRoute.key === route.key) {
                if (tabIdleForRefresh.current === route.key) {
                  clearTimeout(tabIdleResetTimer.current)
                  if (currentListRef.current) {
                    currentListRef.current.scrollToRefresh()
                  }
                  tabIdleForRefresh.current = undefined
                } else {
                  tabIdleForRefresh.current = route.key
                  tabIdleResetTimer.current = setTimeout(() => {
                    tabIdleForRefresh.current = undefined
                  }, REFRESH_IDLE_RESET_TIMEOUT)
                }
              }
            }}
          />
        )
      },
    }
  }, [routes, normalizedIndex, pathname, theme])

  useEffect(() => {
    if (!homeTabs) {
      initHomeTabs().catch((err) => {
        setError(err)
      })
    }
  }, [homeTabs])

  useEffect(() => {
    if (pathname === '/feed' && routes) {
      // TODO: fix it later.
      const unsubscribe = navigation.addListener('tabPress', (e) => {
        if (tabIdleForRefresh.current) {
          clearTimeout(tabIdleResetTimer.current)
          if (currentListRef.current) {
            e.preventDefault()
            currentListRef.current.scrollToRefresh()
          }
          tabIdleForRefresh.current = undefined
        } else {
          tabIdleForRefresh.current = routes[normalizedIndex].key
          tabIdleResetTimer.current = setTimeout(() => {
            tabIdleForRefresh.current = undefined
          }, REFRESH_IDLE_RESET_TIMEOUT)
        }
      })
      return unsubscribe
    }
  }, [navigation, routes, normalizedIndex, pathname])

  if (error) {
    return (
      <View className='flex-1 flex flex-row items-center justify-center bg-white'>
        <View className='px-4 flex items-center justify-center'>
          <Text>{error?.message || '数据加载失败'}</Text>
          <Pressable
            className='mt-4 px-4 h-[44px] w-[200px] rounded-full bg-neutral-900 text-white items-center justify-center active:opacity-60'
            onPress={() => {
              setError(null)
              initHomeTabs().catch((err) => {
                setError(err)
              })
            }}
          >
            <Text className='text-white'>重试</Text>
          </Pressable>
        </View>
      </View>
    )
  }

  if (!routes) {
    return <HomeSkeleton />
  }

  return (
    <>
      <TabView
        key={routes.map((r) => r.key).join(',')}
        navigationState={{ index: normalizedIndex, routes }}
        renderScene={renderScene}
        renderTabBar={renderTabBar}
        onIndexChange={setIndex}
        initialLayout={{
          width: viewWidth,
          height: padLayout.active ? height - 42 - 20 : height - 42 - 50 - 20,
        }}
      />
      <HomeDataPrefetch index={normalizedIndex} routes={routes} />
    </>
  )
}
