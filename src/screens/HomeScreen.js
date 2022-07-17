import React, { useMemo } from 'react'
import { View, Text } from 'react-native'
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs'
import TopicList from '@/Components/TopicList'
import useSWR from 'swr'

const Tab = createMaterialTopTabNavigator()

export default function HomeScreen() {
  const tabsState = useSWR('/page/index/tabs.json')

  const components = useMemo(() => {
    if (!tabsState.data) {
      return null
    }
    const map = {}
    tabsState.data.forEach((tab) => {
      map[tab.value] = (props) => <TopicList type={tab.value} {...props} />
    })
    return map
  }, [tabsState.data])

  if (tabsState.error) {
    return (
      <View>
        <Text>{tabsState.error.message}</Text>
      </View>
    )
  }
  if (!tabsState.data) {
    return (
      <View>
        <Text>LOADING SCREEN</Text>
      </View>
    )
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
      {tabsState.data.map((tab) => (
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
