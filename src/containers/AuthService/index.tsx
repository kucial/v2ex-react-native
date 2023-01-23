import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from 'react'
import { AppState, InteractionManager } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'

import { useCachedState } from '@/utils/hooks'
import * as v2exClient from '@/utils/v2ex-client'

const CACHE_KEY = '$app$/current-user'
const INIT_STATE = {
  user: null,
  meta: null,
  status: 'none', // 'loading' | 'authed' | 'visitor' | failed' | 'logout' | 'none',
}
const CHECK_STATUS_DELAY = 10000

import { getJSON, setJSON } from '@/utils/storage'

import { useAlertService } from '../AlertService'
import { MemberDetail } from '@/types/v2ex'
import clientService from '@/utils/v2ex-client/service'

interface MemberMeta {
  unread_count: number
}

interface AuthState {
  error?: Error
  user: MemberDetail
  meta?: MemberMeta
  status: string
  fetchedAt?: number
}
interface AuthService {
  user?: MemberDetail
  meta?: MemberMeta
  status: string
  fetchedAt?: number
  fetchCurrentUser: (refresh?: boolean) => Promise<MemberDetail>
  logout(): Promise<void>
  composeAuthedNavigation<T = never>(
    func: (params?: T) => void,
  ): (params?: T) => void
  getNextAction(): VoidFunction
  updateMeta: (data: MemberMeta) => void
  goToSigninSreen(): void
}

const CHECK_DURATION = 1000 * 60 * 60 * 12
const shouldCheck = (timestamp?: number) => {
  if (!timestamp) {
    return true
  }
  return Date.now() - timestamp > CHECK_DURATION
}

const getUTCDateString = () => {
  const date = new Date()
  return `${date.getUTCFullYear()}-${('0' + (date.getUTCMonth() + 1)).slice(
    -2,
  )}-${date.getUTCDate()}`
}

export const AuthServiceContext = createContext<AuthService>({
  composeAuthedNavigation: (callback) => {
    return callback || function () {}
  },
} as AuthService)
export default function AuthServiceProvider(props) {
  const navigation =
    useNavigation<NativeStackNavigationProp<AppStackParamList>>()
  const [state, setState] = useCachedState<AuthState>(
    CACHE_KEY,
    INIT_STATE,
    (pre) => {
      if (pre.status === 'loading') {
        pre.status = 'none'
      }
      return pre
    },
  )

  const nextAction = useRef<VoidFunction>()
  const dailySigning = useRef(false)
  const alert = useAlertService()
  const service: AuthService = useMemo(() => {
    const fetchCurrentUser = async (refresh = false) => {
      if (refresh) {
        clientService.reload()
      }
      setState((prev) => ({
        ...prev,
        status: 'loading',
      }))
      try {
        const res = await v2exClient.getCurrentUser()
        setState(() => ({
          user: res.data,
          meta: res.meta,
          status: res.data ? 'authed' : 'visitor',
          fetchedAt: Date.now(),
        }))
        return res.data
      } catch (err) {
        setState((prev) => ({
          ...prev,
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
        const res = await v2exClient.logout({})
        if (res.success) {
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
        return useCallback(
          (...args) => {
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
          },
          [callback],
        )
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
    let timer: NodeJS.Timeout
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (
        appState.match(/background/) &&
        nextAppState === 'active' &&
        shouldCheck(service.fetchedAt)
      ) {
        timer = setTimeout(() => {
          InteractionManager.runAfterInteractions(async () => {
            try {
              const user = await service.fetchCurrentUser()
              if (user && !dailySigning.current) {
                const key = `$app$/daily_sign_in/${getUTCDateString()}`
                if (!getJSON(key)) {
                  try {
                    dailySigning.current = true
                    await v2exClient.dailySignin()
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
  }, [service.fetchCurrentUser, service.user, service.fetchedAt])

  useEffect(() => {
    if (!service.user || shouldCheck(service.fetchedAt)) {
      console.log('....fetchCurrentUser when init...')
      service.fetchCurrentUser()
    }
  }, [])

  // subscribe unread_count
  useEffect(() => {
    const unsubscribe = v2exClient.subscribe('unread_count', (val) => {
      if (val !== state.meta?.unread_count) {
        setState((prev) => ({
          ...prev,
          meta: {
            ...prev.meta,
            unread_count: val,
          },
        }))
      }
    })
    return unsubscribe
  }, [state.meta?.unread_count])

  return (
    <AuthServiceContext.Provider value={service}>
      {props.children}
    </AuthServiceContext.Provider>
  )
}

export const useAuthService = () => useContext(AuthServiceContext)
