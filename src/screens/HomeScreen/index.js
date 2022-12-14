import { useEffect, useMemo, useRef, useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import { useWindowDimensions } from 'react-native'
import { TabBar, TabView } from 'react-native-tab-view'
import { useIsFocused } from '@react-navigation/native'
import colors from 'tailwindcss/colors'

import HomeSkeleton from '@/components/Skeleton/HomeSkeleton'
import { useAppSettings } from '@/containers/AppSettingsService'
import { useTheme } from '@/containers/ThemeService'
import { useCachedState } from '@/hooks'

import NodeTopicList from '../NodeScreen/NodeTopicList'
import TopicList from './TopicList'

const REFRESH_IDLE_RESET_TIMEOUT = 1000
const CACHE_KEY = '$app$/home-screen-index'

export default function HomeScreen(props) {
  const {
    data: { homeTabs },
    initHomeTabs,
  } = useAppSettings()
  const { navigation } = props
  const { width } = useWindowDimensions()
  const [error, setError] = useState()
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

  const [index, setIndex] = useCachedState(CACHE_KEY, 0, (val) => {
    if (!routes) {
      return val
    }
    return val >= routes.length ? 0 : val
  })

  const currentListRef = useRef()
  const tabIdleForRefresh = useRef()
  const tabIdleResetTimer = useRef()
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
              getKey={(index) =>
                `/page/go/${tab.value}/feed.json?p=${index + 1}`
              }
            />
          )
        }
        return (
          <TopicList
            key={`${tab.type}-${tab.value}`}
            isFocused={isActive}
            currentListRef={isActive && currentListRef}
            getKey={
              tab.value === 'recent'
                ? (index) => `/page/recent/topics.json?p=${index + 1}`
                : () => `/page/index/topics.json?tab=${tab.value}`
            }
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
    if (isFocused) {
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
          <Text>{error?.message || '??????????????????'}</Text>
          <Pressable
            className="mt-4 px-4 h-[44px] w-[200px] rounded-full bg-neutral-900 text-white items-center justify-center active:opacity-60"
            onPress={() => {
              setError(null)
              initHomeTabs().catch((err) => {
                setError(err)
              })
            }}>
            <Text className="text-white">??????</Text>
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
