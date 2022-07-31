import { View, Text, Image } from 'react-native'
import React, { useEffect, useMemo } from 'react'
import useSWR from 'swr'
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs'

import MemberInfo from './MemberInfo'
import MemberTopics from './MemberTopics'
import MemberReplies from './MemberReplies'

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

  const components = useMemo(() => {
    return {
      info: (props) => <MemberInfo {...props} username={username} />,
      topics: (props) => <MemberTopics {...props} username={username} />,
      replies: (props) => <MemberReplies {...props} username={username} />
    }
  }, [username])

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarScrollEnabled: false,
        tabBarIndicatorStyle: { backgroundColor: '#111' },
        lazy: true
      }}>
      <Tab.Screen
        key="info"
        name="info"
        component={components.info}
        options={{
          tabBarLabel: '资料'
        }}
      />
      <Tab.Screen
        key="topics"
        name="topics"
        component={components.topics}
        options={{
          tabBarLabel: '主题'
        }}
      />
      <Tab.Screen
        key="replies"
        name="replies"
        component={components.replies}
        options={{
          tabBarLabel: '回复'
        }}
      />
    </Tab.Navigator>
  )

  return (
    <View>
      <View className="px-4 py-3 bg-white flex flex-row shadow-sm">
        <View className="mr-4">
          <Image
            className="w-[60px] h-[60px] rounded"
            source={{ uri: member.avatar_large || member.avatar_mini }}></Image>
        </View>
        <View className="flex-1">
          <View className="mb-1">
            <Text className="text-xl font-semibold">
              {member.username || ''}
            </Text>
          </View>
          <Text className="text-gray-500">
            {member.id
              ? `VE2X 第 ${member.id} 号会员，加入于 ${new Date(
                  member.created * 1000
                ).toLocaleString()}`
              : '    '}
          </Text>
        </View>
      </View>
    </View>
  )
}
