import { View, Text, Image } from 'react-native'
import React, { useEffect, useMemo } from 'react'
import useSWR from 'swr'
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs'

import MemberInfo from './MemberInfo'
import MemberTopics from './MemberTopics'
import MemberReplies from './MemberReplies'
import MemberScreenHeader from './MemberScreenHeader'

const Tab = createMaterialTopTabNavigator()

export default function MemberScreen({ route, navigation }) {
  const { username } = route.params
  const memberSwr = useSWR(`/api/members/show.json?username=${username}`)
  useEffect(() => {
    if (memberSwr.data) {
      navigation.setParams({
        brief: memberSwr.data
      })
    }
  }, [memberSwr.data])

  const tabs = useMemo(() => {
    return [
      {
        value: 'info',
        label: '资料',
        component: (props) => <MemberInfo {...props} username={username} />
      },
      {
        value: 'topics',
        label: '主题',
        component: (props) => <MemberTopics {...props} username={username} />
      },
      {
        value: 'replies',
        label: '回复',
        component: (props) => <MemberReplies {...props} username={username} />
      }
    ]
  }, [username])

  return (
    <View className="flex-1">
      <MemberScreenHeader route={route} navigation={navigation} />
      <Tab.Navigator
        screenOptions={{
          tabBarScrollEnabled: false,
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
    </View>
  )
}
