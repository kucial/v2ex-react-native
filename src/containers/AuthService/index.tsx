import {
  createContext,
  ReactElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from 'react'
import { Alert, AppState, InteractionManager } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'

import { useCachedState } from '@/utils/hooks'
import { getJSON, setJSON } from '@/utils/storage'
import * as v2exClient from '@/utils/v2ex-client'
import clientService from '@/utils/v2ex-client/service'
import {
  BalanceBrief,
  MemberDetail,
  TFA_Error,
} from '@/utils/v2ex-client/types'

import { useAlertService } from '../AlertService'
import prompt2faInput from './prompt2FaInput'
import { AuthService, AuthState } from './types'

const CACHE_KEY = '$app$/current-user'
const INIT_STATE = {
  user: null,
  meta: null,
  status: 'none', // 'loading' | 'authed' | 'visitor' | failed' | 'logout' | 'none',
}
const CHECK_STATUS_DELAY = 10000

const CHECK_DURATION = 1000 * 60 * 60 * 6 // 6 小时
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
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    return callback || function () {}
  },
} as AuthService)
export default function AuthServiceProvider(props: { children: ReactElement }) {
  const navigation =
    useNavigation<NativeStackNavigationProp<AppStackParamList>>()

  const nextAction = useRef<VoidFunction>()
  const dailySigning = useRef(false)
  const alert = useAlertService()

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

  const service: AuthService = useMemo(() => {
    const fetchCurrentUser = async (refresh = false) => {
      if (refresh) {
        clientService.reload(true)
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
        console.log('.....AUTH_ERROR......', err)
        setState((prev) => ({
          ...prev,
          // error: err,
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
        const res = await v2exClient.logout()
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
      composeAuthedNavigation: function <T>(callback) {
        return useCallback(
          (params?: T) => {
            if (state.status === 'loading') {
              alert.alertWithType('info', '提示', '正在验证登录状态，请稍候')
              return
            }
            if (!state.user) {
              navigation.navigate('signin')
              if (callback) {
                nextAction.current = () => {
                  callback(params)
                }
              }
              return
            }
            callback?.(params)
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

  const dailySignIn = useCallback(async (user: MemberDetail) => {
    if (user && !dailySigning.current) {
      const key = `$app$/daily_sign_in/${user.username}/${getUTCDateString()}`
      if (!getJSON(key)) {
        try {
          dailySigning.current = true
          await v2exClient.dailySignin()
          setJSON(key, 1)
          alert.alertWithType('success', '成功', '签到成功')
        } catch (err) {
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
  }, [])

  // 已登陆用户的初始化行为
  useEffect(() => {
    if (service.user) {
      if (shouldCheck(service.fetchedAt)) {
        service.fetchCurrentUser().then(dailySignIn)
      } else {
        dailySignIn(service.user)
      }
    }
  }, [])

  // 已登陆用户，“自动签到” 检测行为
  useEffect(() => {
    if (!service.user) {
      return
    }
    let appState = AppState.currentState
    let timer: NodeJS.Timeout
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (appState.match(/background/) && nextAppState === 'active') {
        timer = setTimeout(() => {
          InteractionManager.runAfterInteractions(async () => {
            try {
              await dailySignIn(service.user)
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
  }, [service.user, dailySignIn])

  // 处理未读消息更新
  useEffect(() => {
    const unsubscribe = v2exClient.subscribe('unread_count', (val: number) => {
      setState((prev) => {
        const current_unread_count = prev.meta?.unread_count
        if (current_unread_count === val) {
          return prev
        }
        return {
          ...prev,
          meta: {
            ...prev.meta,
            unread_count: val,
          },
        }
      })
    })
    return unsubscribe
  }, [])

  // 处理 钱包信息
  useEffect(() => {
    const unsubscribe = v2exClient.subscribe(
      'balance_brief',
      (balanceBrief: BalanceBrief) => {
        setState((prev) => {
          return {
            ...prev,
            meta: {
              ...prev.meta,
              balance: balanceBrief,
            },
          }
        })
      },
    )
    return unsubscribe
  }, [])

  useEffect(() => {
    const unsubscribe = v2exClient.subscribe(
      '2fa_enabled',
      async (error: TFA_Error) => {
        const result = await prompt2faInput(error)
        if (result.action === '2fa_verified') {
          alert.alertWithType('success', '成功', '2FA 验证成功')
        }
      },
    )

    return unsubscribe
  }, [])

  return (
    <AuthServiceContext.Provider value={service}>
      {props.children}
    </AuthServiceContext.Provider>
  )
}

export const useAuthService = () => useContext(AuthServiceContext)
