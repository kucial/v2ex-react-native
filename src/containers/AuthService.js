import { createContext, useContext, useEffect, useMemo, useRef } from 'react'
import { AppState } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import useSWR from 'swr'

import fetcher from '@/utils/fetcher'

import { useAlertService } from './AlertService'
export const AuthServiceContext = createContext({
  user: null,
  status: 'none', // none | loading | authed | failed | failed | logout
  fetchCurrentUser: () => Promise.reject(new Error('no initialized')),
  logout: () => Promise.resolve(),
  composeAuthedNavigation: (callback) => {
    return callback || function () {}
  }
})
let onceLogined = false
const mapStatus = (swr) => {
  if (swr.isValidating) {
    return 'loading'
  }
  if (swr.data) {
    if (swr.data?.data) {
      onceLogined = true
      return 'authed'
    }

    return 'visitor'
  }
  if (swr.error) {
    return 'failed'
  }
  if (onceLogined) {
    return 'logout'
  }
  return 'none'
}
export default function AuthService(props) {
  const navigation = useNavigation()
  const userSwr = useSWR('/custom/auth/current-user.json', {
    revalidateOnMount: true,
    revalidateOnFocus: true
  })
  const nextAction = useRef()
  const alert = useAlertService()
  const service = useMemo(() => {
    const user = userSwr.data?.data
    const meta = userSwr.data?.meta
    const status = mapStatus(userSwr)

    return {
      user,
      meta,
      status,
      fetchCurrentUser: userSwr.mutate,
      logout: async function () {
        try {
          await fetcher('/custom/auth/logout.json')
        } catch (err) {
          alert.alertWithType('error', '错误', err.message)
        } finally {
          userSwr.mutate()
        }
      },
      goToSigninSreen() {
        navigation.navigate('signin')
      },
      composeAuthedNavigation: (callback) => {
        return (...args) => {
          if (status === 'loading') {
            alert.alertWithType('info', '提示', '正在验证登录状态，请稍候')
            return
          }
          if (!user) {
            navigation.navigate('signin')
            if (callback) {
              nextAction.current = () => {
                callback(...args)
              }
            }
            return
          }
          callback?.(...args)
        }
      },
      getNextAction: () => {
        if (nextAction) {
          const action = nextAction.current
          nextAction.current = undefined
          return action
        }
        return undefined
      },
      updateMeta: (patch) => {
        userSwr.mutate(
          (data) => ({
            ...data,
            meta: {
              ...data.meta,
              ...patch
            }
          }),
          false
        )
      }
    }
  }, [userSwr])

  useEffect(() => {
    let appState = AppState.currentState
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (appState.match(/inactive|background/) && nextAppState === 'active') {
        fetcher('/custom/auth/current-user.json').then((res) => {
          userSwr.mutate(res, false)
        })
      }
      appState = nextAppState
    })

    return () => {
      subscription.remove()
    }
  }, [userSwr.mutate])

  return (
    <AuthServiceContext.Provider value={service}>
      {props.children}
    </AuthServiceContext.Provider>
  )
}

export const useAuthService = () => useContext(AuthServiceContext)
