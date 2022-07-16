import React, { useMemo } from 'react'
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs'
import TopicList from '@/Components/TopicList'

const Tab = createMaterialTopTabNavigator()

const tabs = [
  {
    value: 'latest',
    label: '最新'
  },
  {
    value: 'hottest',
    label: '最热'
  },
  {
    value: 'all',
    label: '全部'
  },
  {
    value: 'tech',
    label: '技术'
  },
  {
    value: 'idea',
    label: '创意'
  },
  {
    value: 'play',
    label: '好玩'
  },
  {
    value: 'apple',
    label: 'Apple'
  },
  {
    value: 'job',
    label: '酷工作'
  },
  {
    value: 'deals',
    label: '交易'
  },
  {
    value: 'city',
    label: '城市'
  }
]

export default function HomeScreen({ navigation }) {
  const components = useMemo(() => {
    const map = {}
    tabs.forEach((tab) => {
      map[tab.value] = (props) => <TopicList type={tab.value} {...props} />
    })
    return map
  }, [])

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
        tabBarIndicatorStyle: { backgroundColor: '#111' }
      }}>
      {tabs.map((tab) => (
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
