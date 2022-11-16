import { createContext, useContext, useEffect, useMemo, useRef } from 'react'
import { AppState } from 'react-native'
import { useNavigation } from '@react-navigation/native'

import { useCachedState } from '@/hooks'
import fetcher from '@/utils/fetcher'

const CACHE_KEY = '$app$/current-user'
const INIT_STATE = {
  user: null,
  meta: null,
  status: 'none', // 'loading' | 'authed' | 'visitor' | failed' | 'logout' | 'none',
}

import { getJSON, setJSON } from '@/utils/storage'

import { useAlertService } from './AlertService'
export const AuthServiceContext = createContext({
  ...INIT_STATE,
  fetchCurrentUser: () => Promise.reject(new Error('no initialized')),
  logout: () => Promise.resolve(),
  composeAuthedNavigation: (callback) => {
    return callback || function () {}
  },
})
export default function AuthService(props) {
  const navigation = useNavigation()
  const [state, setState] = useCachedState(CACHE_KEY, INIT_STATE, (pre) => {
    pre.status = 'none'
    return pre
  })

  const nextAction = useRef()
  const dailySigning = useRef(false)
  const alert = useAlertService()
  const service = useMemo(() => {
    const fetchCurrentUser = async () => {
      setState((prev) => ({
        ...prev,
        status: 'loading',
      }))
      try {
        const res = await fetcher('/custom/auth/current-user.json')
        setState(() => ({
          user: res.data,
          meta: res.meta,
          status: res.data ? 'authed' : 'visitor',
        }))
      } catch (err) {
        setState(() => ({
          error: err,
          status: 'failed',
        }))
      }
    }
    const logout = async () => {
      try {
        await fetcher('/custom/auth/logout.json')
      } catch (err) {
        alert.alertWithType('error', '错误', err.message)
      } finally {
        fetchCurrentUser()
      }
    }

    return {
      ...state,
      fetchCurrentUser,
      logout,
      goToSigninSreen() {
        navigation.navigate('signin')
      },
      composeAuthedNavigation: (callback) => {
        return (...args) => {
          if (state.status === 'loading') {
            alert.alertWithType('info', '提示', '正在验证登录状态，请稍候')
            return
          }
          if (!state.user) {
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
        setState((prev) => ({
          ...prev,
          meta: {
            ...prev.meta,
            ...patch,
          },
        }))
      },
    }
  }, [state])

  useEffect(() => {
    let appState = AppState.currentState
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (appState.match(/inactive|background/) && nextAppState === 'active') {
        service.fetchCurrentUser()
      }
      appState = nextAppState
    })

    return () => {
      subscription.remove()
    }
  }, [service.fetchCurrentUser])

  useEffect(() => {
    if (service.status === 'authed' && !dailySigning.current) {
      const date = new Date().toLocaleDateString()
      const key = `$app$/sign_in/${date}`
      if (!getJSON(key)) {
        dailySigning.current = true
        fetcher('/custom/daily-sign-in.json')
          .then(() => {
            setJSON(key, 1)
            alert.alertWithType('success', '成功', '签到成功')
          })
          .catch((err) => {
            console.log(err)
            if (err.code === 'DAILY_SIGNED') {
              setJSON(key, 1)
              alert.alertWithType('info', '提示', err.message)
            } else {
              alert.alertWithType('error', '错误', err.message)
            }
          })
          .finally(() => {
            dailySigning.current = false
          })
      }
    }
  }, [service.status])

  useEffect(() => {
    service.fetchCurrentUser()
  }, [])

  console.log('service status', service.status)

  return (
    <AuthServiceContext.Provider value={service}>
      {props.children}
    </AuthServiceContext.Provider>
  )
}

export const useAuthService = () => useContext(AuthServiceContext)
