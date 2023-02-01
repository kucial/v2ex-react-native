import { useEffect, useMemo, useRef, useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import { useWindowDimensions } from 'react-native'
import { TabBar, TabView } from 'react-native-tab-view'
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs'
import { CompositeScreenProps, useIsFocused } from '@react-navigation/native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'

import HomeTopicList from '@/components/HomeTopicList'
import NodeTopicList from '@/components/NodeTopicList'
import HomeSkeleton from '@/components/Skeleton/HomeSkeleton'
import { useAppSettings } from '@/containers/AppSettingsService'
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
  const { width } = useWindowDimensions()
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

  const [index, setIndex] = useCachedState<number>(CACHE_KEY, 0, (val) => {
    if (!routes) {
      return val
    }
    return val >= routes.length ? 0 : val
  })

  const currentListRef = useRef<RefreshableView>(null)
  const tabIdleForRefresh = useRef<string>(null)
  const tabIdleResetTimer = useRef<NodeJS.Timeout>()
  const isFocused = useIsFocused()

  const { renderScene, renderTabBar } = useMemo(() => {
    if (!homeTabs) {
      return {}
    }

    return {
      renderScene: ({ route }) => {
        const { tab } = route
        const isActive = isFocused && route.key === routes[index].key
        if (tab.type === 'node') {
          return (
            <NodeTopicList
              key={`${tab.type}-${tab.value}`}
              isFocused={isActive}
              currentListRef={isActive && currentListRef}
              name={tab.value}
            />
          )
        }
        return (
          <HomeTopicList
            key={`${tab.type}-${tab.value}`}
            isFocused={isActive}
            currentListRef={isActive && currentListRef}
            tab={tab.value}
          />
        )
      },
      renderTabBar: (props) => {
        return (
          <TabBar
            {...props}
            scrollEnabled
            indicatorStyle={{
              backgroundColor: theme.colors.primary,
            }}
            style={styles.layer1}
            tabStyle={{
              flexShrink: 0,
              width: 'auto',
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
              const currentRoute = routes[index]
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
  }, [routes, index, isFocused, theme])

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
          tabIdleForRefresh.current = routes[index].key
          tabIdleResetTimer.current = setTimeout(() => {
            tabIdleForRefresh.current = undefined
          }, REFRESH_IDLE_RESET_TIMEOUT)
        }
      })
      return unsubscribe
    }
  }, [navigation, routes, index, isFocused])

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
      navigationState={{ index, routes }}
      renderScene={renderScene}
      renderTabBar={renderTabBar}
      onIndexChange={setIndex}
      initialLayout={{ width }}
    />
  )
}
