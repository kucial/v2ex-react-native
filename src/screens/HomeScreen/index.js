import React, { useEffect, useMemo, useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import { useWindowDimensions } from 'react-native'
import { TabBar, TabView } from 'react-native-tab-view'
import { useTailwind } from 'tailwindcss-react-native'

import HomeSkeleton from '@/components/Skeleton/HomeSkeleton'
import { useAppSettings } from '@/containers/AppSettingsService'

import NodeTopicList from '../NodeScreen/NodeTopicList'
import TopicList from './TopicList'

const renderTabBar = (props) => {
  const tw = useTailwind()
  return (
    <TabBar
      {...props}
      scrollEnabled
      indicatorStyle={tw('bg-neutral-800  dark:bg-neutral-300')}
      style={tw('bg-white dark:bg-neutral-900')}
      labelStyle={tw('text-neutral-900 dark:text-neutral-200 text-[13px]')}
      tabStyle={{
        flexShrink: 0,
        width: 'auto',
        height: 42,
        paddingTop: 4
      }}
      contentContainerStyle={{
        display: 'flex',
        flexDirection: 'row',
        overflow: 'scroll'
      }}
    />
  )
}

export default function HomeScreen() {
  const {
    data: { homeTabs },
    initHomeTabs
  } = useAppSettings()
  const { width } = useWindowDimensions()
  const [error, setError] = useState()
  const [index, setIndex] = useState(0)

  const { renderScene, routes } = useMemo(() => {
    if (!homeTabs) {
      return {}
    }
    const routes = []
    homeTabs.forEach((tab) => {
      if (tab.disabled) {
        return
      }
      const key = `home-${tab.type}-${tab.value}`
      routes.push({
        key,
        title: tab.label,
        tab: tab
      })
    })

    return {
      routes,
      renderScene: ({ route }) => {
        const { tab } = route
        if (tab.type === 'node') {
          return (
            <NodeTopicList
              key={`${tab.type}-${tab.value}`}
              isFocused={route.key === routes[index].key}
              getKey={(index) =>
                `/page/go/${tab.value}/feed.json?p=${index + 1}`
              }
            />
          )
        }
        return (
          <TopicList
            key={`${tab.type}-${tab.value}`}
            isFocused={route.key === routes[index].key}
            getKey={
              tab.value === 'recent'
                ? (index) => `/page/recent/topics.json?p=${index + 1}`
                : () => `/page/index/topics.json?tab=${tab.value}`
            }
          />
        )
      }
    }
  }, [homeTabs, index])

  useEffect(() => {
    if (!homeTabs) {
      initHomeTabs().catch((err) => {
        setError(err)
      })
    }
  }, [homeTabs])

  if (error) {
    return (
      <View className="flex-1 flex flex-row items-center justify-center bg-white">
        <View className="px-4 flex items-center justify-center">
          <Text>{error?.message || '数据加载失败'}</Text>
          <Pressable
            disabled={tabsSwr.isValidating}
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
