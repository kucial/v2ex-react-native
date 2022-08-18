import React, { useMemo } from 'react'
import { ScrollView, RefreshControl, View, Text, Pressable } from 'react-native'
import useSWR from 'swr'
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs'
import HomeSkeleton from '@/components/Skeleton/HomeSkeleton'
import Loader from '@/components/Loader'

import TopicList from './TopicList'

const Tab = createMaterialTopTabNavigator()

export default function HomeScreen() {
  const tabsSwr = useSWR('/page/index/tabs.json', {
    revalidateIfStale: false,
    shouldRetryOnError: false
  })

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
          <Text>
            {tabsSwr.error?.message ||
              'Elit veniam laboris sunt esse aliqua dolore aliquip laborum proident ea velit nisi consectetur velit. Officia aliquip enim officia nostrud dolor mollit duis culpa. Et aliquip fugiat veniam aliquip excepteur consectetur Lorem labore aliqua qui sint. Elit ea duis adipisicing culpa anim. Lorem Lorem consequat ad occaecat ut minim veniam. Adipisicing culpa duis laboris duis duis laborum.'}
          </Text>
          <Pressable
            disabled={tabsSwr.isValidating}
            className="mt-4 px-4 h-[44px] w-[200px] rounded-full bg-gray-900 text-white items-center justify-center active:opacity-60"
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
        tabBarItemStyle: {
          paddingHorizontal: 6,
          flexGrow: 0,
          flexShrink: 0,
          minWidth: 0,
          width: 62,
          minHeight: 42
        },
        tabBarIndicatorStyle: { backgroundColor: '#111' },
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
