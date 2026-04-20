import { useCallback } from 'react'
import { useRouter } from 'expo-router'

import { useAlertService } from '@/containers/AlertService'
import { useAuthStore } from '@/stores/auth'

export function useLogout() {
  const alert = useAlertService()
  return useCallback(() => {
    useAuthStore.getState().logout((err) => {
      alert.show({ type: 'error', message: err.message })
    })
  }, [alert])
}

export function useGoToSigninScreen() {
  const router = useRouter()
  return useCallback(() => {
    router.push('/signin')
  }, [router])
}

export function useComposeAuthedNavigation() {
  const router = useRouter()
  const alert = useAlertService()

  return useCallback(
    function <T>(callback?: (params?: T) => void) {
      return (params?: T) => {
        const { status, user, setNextAction } = useAuthStore.getState()
        if (status === 'loading') {
          alert.show({
            type: 'info',
            message: '提示 正在验证登录状态，请稍候',
          })
          return
        }
        if (!user) {
          router.push('/signin')
          if (callback) {
            setNextAction(() => {
              callback(params)
            })
          }
          return
        }
        callback?.(params)
      }
    },
    [router, alert],
  )
}
