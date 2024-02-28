import { useEffect, useMemo, useRef, useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import { useWindowDimensions } from 'react-native'
import { useSharedValue } from 'react-native-reanimated'
import { TabBar, TabView } from 'react-native-tab-view'
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs'
import { CompositeScreenProps, useIsFocused } from '@react-navigation/native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'

import HomeTopicList from '@/components/HomeTopicList'
import NodeTopicList from '@/components/NodeTopicList'
import HomeSkeleton from '@/components/Skeleton/HomeSkeleton'
import { APP_SIDEBAR_SIZE } from '@/constants'
import { useAppSettings, usePadLayout } from '@/containers/AppSettingsService'
import { useTheme } from '@/containers/ThemeService'
import { useCachedState } from '@/utils/hooks'

const REFRESH_IDLE_RESET_TIMEOUT = 1000
const CACHE_KEY = '$app$/home-screen-index'

type HomeScreenProps = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'feed'>,
  NativeStackScreenProps<AppStackParamList>
>

interface RefreshableView {
  scrollToRefresh(): void
}

export default function HomeScreen(props: HomeScreenProps) {
  const {
    data: { homeTabs },
    initHomeTabs,
  } = useAppSettings()
  const { navigation } = props
  const { width, height } = useWindowDimensions()
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

  const normalizedIndex = Math.min(index, routes ? routes.length - 1 : 0)

  const currentListRef = useRef<RefreshableView>(null)
  const tabIdleForRefresh = useRef<string>(null)
  const tabIdleResetTimer = useRef<NodeJS.Timeout>()
  const isFocused = useIsFocused()
  const scrollY = useSharedValue(0)

  const { renderScene, renderTabBar } = useMemo(() => {
    if (!homeTabs) {
      return {}
    }

    return {
      renderScene: ({ route }) => {
        const { tab } = route
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
            }}
            style={styles.layer1}
            tabStyle={{
              flexShrink: 0,
              width: 'auto',
              minWidth: 56,
              height: 42,
              paddingTop: 4,
            }}
            contentContainerStyle={{
              display: 'flex',
              flexDirection: 'row',
              overflow: 'scroll',
            }}
            renderLabel={(props) => {
              return (
                <Text
                  style={{
                    color: props.focused
                      ? theme.colors.primary
                      : theme.colors.text,
                    fontWeight: props.focused ? '600' : '400',
                    fontSize: 13,
                  }}>
                  {props.route.title}
                </Text>
              )
            }}
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
  }, [routes, normalizedIndex, isFocused, theme])

  useEffect(() => {
    if (!homeTabs) {
      initHomeTabs().catch((err) => {
        setError(err)
      })
    }
  }, [homeTabs])

  useEffect(() => {
    if (isFocused && routes) {
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
  }, [navigation, routes, normalizedIndex, isFocused])

  if (error) {
    return (
      <View className="flex-1 flex flex-row items-center justify-center bg-white">
        <View className="px-4 flex items-center justify-center">
          <Text>{error?.message || '数据加载失败'}</Text>
          <Pressable
            className="mt-4 px-4 h-[44px] w-[200px] rounded-full bg-neutral-900 text-white items-center justify-center active:opacity-60"
            onPress={() => {
              setError(null)
              initHomeTabs().catch((err) => {
                setError(err)
              })
            }}>
            <Text className="text-white">重试</Text>
          </Pressable>
        </View>
      </View>
    )
  }

  if (!routes) {
    return <HomeSkeleton />
  }

  return (
    <TabView
      key={routes.map((r) => r.key).join(',')}
      navigationState={{ index: normalizedIndex, routes }}
      renderScene={renderScene}
      renderTabBar={renderTabBar}
      onIndexChange={setIndex}
      initialLayout={{
        width:
          padLayout.active && padLayout.orientation === 'PORTRAIT'
            ? width - APP_SIDEBAR_SIZE
            : width,
        height: padLayout.active ? height - 42 - 20 : height - 42 - 50 - 20,
      }}
    />
  )
}
