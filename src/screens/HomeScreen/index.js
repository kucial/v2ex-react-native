import React, { useEffect, useMemo, useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs'
import colors from 'tailwindcss/colors'
import { useColorScheme, useTailwind } from 'tailwindcss-react-native'

import HomeSkeleton from '@/components/Skeleton/HomeSkeleton'
import { useAppSettings } from '@/containers/AppSettingsService'

import NodeTopicList from '../NodeScreen/NodeTopicList'
import TopicList from './TopicList'

const Tab = createMaterialTopTabNavigator()

export default function HomeScreen() {
  const {
    data: { homeTabs },
    initHomeTabs
  } = useAppSettings()
  const { colorScheme } = useColorScheme()
  const [error, setError] = useState()

  const tw = useTailwind()

  const tabs = useMemo(() => {
    return (
      homeTabs &&
      homeTabs.map((tab) => ({
        name: `home-${tab.type}-${tab.value}`,
        label: tab.label,
        component:
          tab.type === 'node'
            ? (props) => (
                <NodeTopicList
                  key={`${tab.type}-${tab.value}`}
                  getKey={(index) =>
                    `/page/go/${tab.value}/feed.json?p=${index + 1}`
                  }
                  {...props}
                />
              )
            : (props) => (
                <TopicList
                  key={`${tab.type}-${tab.value}`}
                  getKey={
                    tab.value === 'recent'
                      ? (index) => `/page/recent/topics.json?p=${index + 1}`
                      : () => `/page/index/topics.json?tab=${tab.value}`
                  }
                  {...props}
                />
              )
      }))
    )
  }, [homeTabs])

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

  if (!tabs) {
    return <HomeSkeleton />
  }

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarScrollEnabled: true,
        tabBarItemStyle: tw(
          'px-[6px] flex-grow-0 flex-shrink-0 min-w-0 w-[62px] min-h-[42px]'
        ),
        tabBarLabelStyle: tw('text-neutral-900 dark:text-neutral-200'),
        tabBarStyle: tw('bg-white dark:bg-neutral-900'),
        tabBarActiveTintColor:
          colorScheme === 'dark' ? colors.amber[50] : colors.neutral[900],
        // tabBarContentContainerStyle: tw('dark:bg-neutral-900'),
        lazy: true
      }}>
      {tabs.map((tab) => (
        <Tab.Screen
          key={tab.name}
          name={tab.name}
          options={{
            tabBarLabel: tab.label
          }}>
          {tab.component}
        </Tab.Screen>
      ))}
    </Tab.Navigator>
  )
}
