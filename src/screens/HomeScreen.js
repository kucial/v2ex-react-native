import React, { useMemo } from 'react'
import useSWR from 'swr'
import { View, Text } from 'react-native'
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs'
import TopicList from '@/Components/TopicList'
import HomeSkeleton from '@/Components/Skeleton/HomeSkeleton'
import ErrorNotice from '@/Components/ErrorNotice'

const Tab = createMaterialTopTabNavigator()

export default function HomeScreen() {
  const tabsSwr = useSWR('/page/index/tabs.json')

  const components = useMemo(() => {
    if (!tabsSwr.data) {
      return null
    }
    const map = {}
    tabsSwr.data.forEach((tab) => {
      map[tab.value] = (props) => <TopicList type={tab.value} {...props} />
    })
    return map
  }, [tabsSwr.data])

  if (tabsSwr.error) {
    return <ErrorNotice error={tabsSwr.error} />
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
      {tabsSwr.data.map((tab) => (
        <Tab.Screen
          key={tab.value}
          name={tab.value}
          component={components[tab.value]}
          options={{
            tabBarLabel: tab.label
          }}
        />
      ))}
    </Tab.Navigator>
  )
}
