import { useEffect } from 'react'
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'

import * as v2exClient from '@/utils/v2ex-client'

import { useAlertService } from '../AlertService'
import { useAuthService } from '../AuthService'

export default function NotificationService(props) {
  const navigation = useNavigation<
    NativeStackNavigationProp<AppStackParamList> &
      BottomTabNavigationProp<MainTabParamList>
  >()
  const alert = useAlertService()
  const { meta, composeAuthedNavigation } = useAuthService()

  const onAlertPress = composeAuthedNavigation(() => {
    navigation.navigate('notification')
  })

  useEffect(() => {
    const unsubscribe = v2exClient.subscribe('unread_count', (val: number) => {
      if (val && val !== meta?.unread_count) {
        alert.show({
          type: 'info',
          message: `您有 ${val} 条未读消息`,
          duration: 500,
          onPress: onAlertPress,
        })
      }
    })
    return unsubscribe
  }, [meta?.unread_count, navigation])

  return props.children
}
