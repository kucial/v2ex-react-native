import { useEffect } from 'react'
import { useRouter } from 'expo-router'

import { useAuthStore } from '@/stores/auth'
import * as v2exClient from '@/utils/v2ex-client'

import { useAlertService } from '../AlertService'
import { useComposeAuthedNavigation } from '../AuthService'

export default function NotificationService(props) {
  const alert = useAlertService()
  const meta = useAuthStore((s) => s.meta)
  const composeAuthedNavigation = useComposeAuthedNavigation()
  const router = useRouter()

  const onAlertPress = composeAuthedNavigation(() => {
    router.push('/me/notification')
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
  }, [meta?.unread_count, onAlertPress])

  return props.children
}
