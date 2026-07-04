import {
  ComponentProps,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native'
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
import { HomeTabOption } from '@/utils/v2ex-client/types'

import HomeDataPrefetch from './HomeDataPrefetch'

const REFRESH_IDLE_RESET_TIMEOUT = 1000
const CACHE_KEY = '$app$/home-screen-index'

const TAB_STYLE = {
  flexShrink: 0,
  width: 'auto' as const,
  minWidth: 56,
  height: 42,
  paddingTop: 3,
}

interface RefreshableView {
  scrollToRefresh(): void
}

type HomeRoute = {
  key: string
  title: string
  tab: HomeTabOption
}

type TabPressNavigation = {
  addListener(
    event: 'tabPress',
    callback: (event: { preventDefault(): void }) => void,
  ): () => void
}

export default function HomeScreen() {
  const {
    data: { homeTabs },
    initHomeTabs,
  } = useAppSettings()
  const { width, height } = useWindowDimensions()
  const { tab: queryTab } = useLocalSearchParams<{ tab: string }>()
  const insets = useSafeAreaInsets()
  const padLayout = usePadLayout()
  const [error, setError] = useState<Error | null>(null)
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
      .filter((route): route is HomeRoute => !!route)
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
  const normalizedIndexRef = useRef(normalizedIndex)
  normalizedIndexRef.current = normalizedIndex

  const currentListRef = useRef<RefreshableView | null>(null)
  const inactiveListRef = useRef<RefreshableView | null>(null)
  const tabIdleForRefresh = useRef<string | null>(null)
  const tabIdleResetTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const scrollY = useSharedValue(0)

  const viewWidth =
    padLayout.active && padLayout.orientation === 'PORTRAIT'
      ? width - APP_SIDEBAR_SIZE - insets.left - insets.right
      : width - insets.left - insets.right

  const indicatorStyle = useMemo(
    () => ({
      backgroundColor: theme.colors.primary,
      height: 2,
    }),
    [theme.colors.primary],
  )

  const contentContainerStyle = useMemo(
    () => ({
      display: 'flex' as const,
      flexDirection: 'row' as const,
      minWidth: viewWidth,
      overflow: 'scroll' as const,
    }),
    [viewWidth],
  )

  const renderScene = useCallback(
    ({ route }: { route: HomeRoute }) => {
      const { tab } = route
      const isFocused = pathname === '/feed'
      const isActive =
        isFocused && route.key === routes?.[normalizedIndexRef.current]?.key
      switch (tab.type) {
        case 'node':
          return (
            <NodeTopicList
              key={`${tab.type}-${tab.value}`}
              isFocused={isActive}
              currentListRef={isActive ? currentListRef : inactiveListRef}
              name={tab.value}
              scrollY={scrollY}
            />
          )
        case 'home':
          return (
            <HomeTopicList
              key={`${tab.type}-${tab.value}`}
              isFocused={isActive}
              currentListRef={isActive ? currentListRef : inactiveListRef}
              tab={tab.value}
            />
          )
        case 'xna':
          return (
            <XnaTopicList
              key='xna'
              isFocused={isActive}
              currentListRef={isActive ? currentListRef : inactiveListRef}
            />
          )
        case 'planet':
          return (
            <PlanetFeedList
              key='planet'
              isFocused={isActive}
              currentListRef={isActive ? currentListRef : inactiveListRef}
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
    [routes, pathname],
  )

  const handleTabPress = useCallback(
    ({ route }: { route: HomeRoute }) => {
      const currentRoute = routes?.[normalizedIndexRef.current]
      if (currentRoute?.key === route.key) {
        if (tabIdleForRefresh.current === route.key) {
          if (tabIdleResetTimer.current) {
            clearTimeout(tabIdleResetTimer.current)
          }
          if (currentListRef.current) {
            currentListRef.current.scrollToRefresh()
          }
          tabIdleForRefresh.current = null
        } else {
          tabIdleForRefresh.current = route.key
          tabIdleResetTimer.current = setTimeout(() => {
            tabIdleForRefresh.current = null
          }, REFRESH_IDLE_RESET_TIMEOUT)
        }
      }
    },
    [routes],
  )

  const renderTabBar = useCallback(
    (props: ComponentProps<typeof TabBar<HomeRoute>>) => {
      return (
        <TabBar
          {...props}
          scrollEnabled
          pressColor={theme.colors.bg_layer3}
          indicatorStyle={indicatorStyle}
          style={styles.layer1}
          tabStyle={TAB_STYLE}
          contentContainerStyle={contentContainerStyle}
          activeColor={
            typeof theme.colors.primary === 'string'
              ? theme.colors.primary
              : undefined
          }
          inactiveColor={
            typeof theme.colors.text === 'string'
              ? theme.colors.text
              : undefined
          }
          onTabPress={handleTabPress}
        />
      )
    },
    [
      theme,
      styles.layer1,
      indicatorStyle,
      contentContainerStyle,
      handleTabPress,
    ],
  )

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
      const unsubscribe = (
        navigation as unknown as TabPressNavigation
      ).addListener('tabPress', (e) => {
        if (tabIdleForRefresh.current) {
          if (tabIdleResetTimer.current) {
            clearTimeout(tabIdleResetTimer.current)
          }
          if (currentListRef.current) {
            e.preventDefault()
            currentListRef.current.scrollToRefresh()
          }
          tabIdleForRefresh.current = null
        } else {
          tabIdleForRefresh.current =
            routes[normalizedIndexRef.current]?.key ?? null
          tabIdleResetTimer.current = setTimeout(() => {
            tabIdleForRefresh.current = null
          }, REFRESH_IDLE_RESET_TIMEOUT)
        }
      })
      return unsubscribe
    }
  }, [navigation, routes, pathname])

  const initialLayout = useMemo(
    () => ({
      width: viewWidth,
      height: padLayout.active ? height - 42 - 20 : height - 42 - 50 - 20,
    }),
    [viewWidth, padLayout.active, height],
  )

  const navigationState = useMemo(
    () => ({
      index: normalizedIndex,
      routes: routes ?? [],
    }),
    [normalizedIndex, routes],
  )

  if (error) {
    return (
      <View
        style={[
          homeStyles.errorContainer,
          { backgroundColor: theme.colors.bg_layer1 },
        ]}
      >
        <View style={homeStyles.errorInner}>
          <Text style={styles.text}>{error?.message || '数据加载失败'}</Text>
          <Pressable
            style={({ pressed }) => [
              homeStyles.retryBtn,
              { backgroundColor: theme.colors.primary },
              pressed && homeStyles.pressed,
            ]}
            onPress={() => {
              setError(null)
              initHomeTabs().catch((err) => {
                setError(err)
              })
            }}
          >
            <Text style={{ color: '#ffffff' }}>重试</Text>
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
        navigationState={navigationState}
        renderScene={renderScene}
        renderTabBar={renderTabBar}
        onIndexChange={setIndex}
        initialLayout={initialLayout}
      />
      <HomeDataPrefetch index={normalizedIndex} routes={routes} />
    </>
  )
}

const homeStyles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorInner: {
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryBtn: {
    marginTop: 16,
    paddingHorizontal: 16,
    height: 44,
    width: 200,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.6,
  },
})
