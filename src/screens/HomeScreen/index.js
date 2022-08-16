import React, { useMemo } from 'react'
import { ScrollView, RefreshControl } from 'react-native'
import useSWR from 'swr'
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs'
import HomeSkeleton from '@/components/Skeleton/HomeSkeleton'
import ErrorNotice from '@/components/ErrorNotice'
import TopicList from './TopicList'

const Tab = createMaterialTopTabNavigator()

export default function HomeScreen() {
  const tabsSwr = useSWR('/page/index/tabs.json')

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
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={tabsSwr.isValidating}
            onRefresh={tabsSwr.mutate}
          />
        }>
        <ErrorNotice error={tabsSwr.error} />
      </ScrollView>
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
