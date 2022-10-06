import React, { useMemo } from 'react'
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native'
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs'
import useSWR from 'swr'
import colors from 'tailwindcss/colors'
import { useColorScheme, useTailwind } from 'tailwindcss-react-native'

import Loader from '@/components/Loader'
import HomeSkeleton from '@/components/Skeleton/HomeSkeleton'

import TopicList from './TopicList'

const Tab = createMaterialTopTabNavigator()

export default function HomeScreen() {
  const tabsSwr = useSWR('/page/index/tabs.json', {
    revalidateIfStale: false,
    shouldRetryOnError: false
  })
  const { colorScheme } = useColorScheme()

  const tw = useTailwind()

  const tabs = useMemo(() => {
    if (!tabsSwr.data) {
      return []
    }

    return [
      {
        value: 'recent',
        label: '最近'
      },
      ...tabsSwr.data
    ]
      .filter((item) => item.value !== 'nodes')

      .map((tab) => ({
        ...tab,
        component: (props) => (
          <TopicList
            key={tab.value}
            type={tab.value}
            getKey={
              tab.value === 'recent'
                ? (index) => `/page/recent/topics.json?p=${index + 1}`
                : () => `/page/index/topics.json?tab=${tab.value}`
            }
            {...props}
          />
        )
      }))
  }, [tabsSwr.data])

  if (tabsSwr.error) {
    return (
      <View className="flex-1 flex flex-row items-center justify-center bg-white">
        <View className="px-4 flex items-center justify-center">
          <Text>{tabsSwr.error?.message || '数据加载失败'}</Text>
          <Pressable
            disabled={tabsSwr.isValidating}
            className="mt-4 px-4 h-[44px] w-[200px] rounded-full bg-neutral-900 text-white items-center justify-center active:opacity-60"
            onPress={() => {
              tabsSwr.mutate()
            }}>
            {tabsSwr.isValidating ? (
              <Loader size={20} color="#ffffffbc" />
            ) : (
              <Text className="text-white">重试</Text>
            )}
          </Pressable>
        </View>
      </View>
    )
  }

  if (!tabsSwr.data) {
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
          key={tab.value}
          name={tab.value}
          options={{
            tabBarLabel: tab.label
          }}>
          {tab.component}
        </Tab.Screen>
      ))}
    </Tab.Navigator>
  )
}
