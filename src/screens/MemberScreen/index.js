import { useMemo } from 'react'
import { StatusBar, View } from 'react-native'
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs'

import { useSWR } from '@/utils/swr'

import MemberReplies from './MemberReplies'
import MemberScreenHeader from './MemberScreenHeader'
import MemberTopics from './MemberTopics'

const Tab = createMaterialTopTabNavigator()

export default function MemberScreen({ route, navigation }) {
  const { username } = route.params
  const memberSwr = useSWR(`/page/member/${username}/info.json`, {
    revalidateOnMount: true,
  })
  // useEffect(() => {
  //   if (memberSwr.data) {
  //     navigation.setParams({
  //       brief: memberSwr.data
  //     })
  //   }
  // }, [memberSwr.data])

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
      <StatusBar translucent backgroundColor="transparent" />
      <MemberScreenHeader
        route={route}
        swr={memberSwr}
        navigation={navigation}
      />
      <Tab.Navigator
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
