import { useMemo } from 'react'
import { Platform, StatusBar, View } from 'react-native'
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import useSWR from 'swr'

import { getMemberDetail } from '@/utils/v2ex-client'

import MemberReplies from './MemberReplies'
import MemberScreenHeader from './MemberScreenHeader'
import MemberTopics from './MemberTopics'

const Tab = createMaterialTopTabNavigator()

type MemberScreenProps = NativeStackScreenProps<AppStackParamList, 'member'>

export default function MemberScreen({ route, navigation }: MemberScreenProps) {
  const { username, tab } = route.params
  const memberSwr = useSWR(
    [`/page/member/:username/info.json`, username],
    async ([_, username]) => {
      const { data } = await getMemberDetail({ username })
      return data
    },
    {
      onErrorRetry(err) {
        if (err.response?.status === 404) {
          return
        }
      },
    },
  )

  const tabs = useMemo(() => {
    return [
      {
        value: 'topics',
        label: '主题',
        component: (props) => <MemberTopics {...props} username={username} />,
      },
      {
        value: 'replies',
        label: '回复',
        component: (props) => <MemberReplies {...props} username={username} />,
      },
    ]
  }, [username])

  return (
    <View className="flex-1">
      {Platform.OS === 'ios' && (
        <StatusBar translucent backgroundColor="transparent" />
      )}
      <MemberScreenHeader
        route={route}
        swr={memberSwr}
        navigation={navigation}
      />
      <Tab.Navigator
        initialRouteName={tab}
        screenOptions={{
          tabBarScrollEnabled: false,
          lazy: true,
        }}>
        {tabs.map((tab) => (
          <Tab.Screen
            key={tab.value}
            name={tab.value}
            options={{
              tabBarLabel: tab.label,
            }}>
            {tab.component}
          </Tab.Screen>
        ))}
      </Tab.Navigator>
    </View>
  )
}
