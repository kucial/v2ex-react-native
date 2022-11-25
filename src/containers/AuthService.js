import { createContext, useContext, useEffect, useMemo, useRef } from 'react'
import { AppState, InteractionManager } from 'react-native'
import { useNavigation } from '@react-navigation/native'

import { useCachedState } from '@/hooks'
import fetcher from '@/utils/fetcher'

const CACHE_KEY = '$app$/current-user'
const INIT_STATE = {
  user: null,
  meta: null,
  status: 'none', // 'loading' | 'authed' | 'visitor' | failed' | 'logout' | 'none',
}
const CHECK_STATUS_DELAY = 2000

import { getJSON, setJSON } from '@/utils/storage'

import { useAlertService } from './AlertService'

const getUTCDateString = () => {
  const date = new Date()
  return `${date.getUTCFullYear()}-${('0' + (date.getUTCMonth() + 1)).slice(
    -2,
  )}-${date.getUTCDate()}`
}

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
        return res.data
      } catch (err) {
        setState(() => ({
          error: err,
          status: 'failed',
        }))
      }
    }
    const logout = async () => {
      let prevStatus
      try {
        setState((prev) => {
          prevStatus = prev.status
          return {
            ...prev,
            status: 'logingout',
          }
        })
        const result = await fetcher('/custom/auth/logout.json')
        if (result.success) {
          setState(() => ({
            ...INIT_STATE,
            status: 'logout',
          }))
        }
      } catch (err) {
        alert.alertWithType('error', '错误', err.message)
        setState((prev) => ({
          ...prev,
          status: prevStatus,
        }))
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
    if (!service.user) {
      return
    }
    let appState = AppState.currentState
    let timer
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (appState.match(/background/) && nextAppState === 'active') {
        timer = setTimeout(() => {
          InteractionManager.runAfterInteractions(async () => {
            try {
              const user = await service.fetchCurrentUser()
              if (user && !dailySigning.current) {
                const key = `$app$/daily_sign_in/${getUTCDateString()}`
                if (!getJSON(key)) {
                  try {
                    dailySigning.current = true
                    await fetcher('/custom/daily-sign-in.json')
                    setJSON(key, 1)
                    alert.alertWithType('success', '成功', '签到成功')
                  } catch (err) {
                    console.log(err)
                    if (err.code === 'DAILY_SIGNED') {
                      setJSON(key, 1)
                      alert.alertWithType('info', '提示', err.message)
                    } else {
                      alert.alertWithType('error', '错误', err.message)
                    }
                  } finally {
                    dailySigning.current = false
                  }
                }
              }
            } catch (err) {}
          })
        }, CHECK_STATUS_DELAY)
      } else {
        clearTimeout(timer)
        timer = undefined
      }
      appState = nextAppState
    })

    return () => {
      subscription.remove()
    }
  }, [service.fetchCurrentUser, service.user])

  useEffect(() => {
    service.fetchCurrentUser()
  }, [])

  return (
    <AuthServiceContext.Provider value={service}>
      {props.children}
    </AuthServiceContext.Provider>
  )
}

export const useAuthService = () => useContext(AuthServiceContext)
