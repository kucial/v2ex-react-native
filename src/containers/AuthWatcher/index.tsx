import { useCallback, useEffect, useMemo, useRef } from 'react'
import { AppState, InteractionManager } from 'react-native'

import { useShallow } from 'zustand/react/shallow'

import { useAuthStore, AuthState } from '@/stores/auth'
import { getJSON, setJSON, storage } from '@/utils/storage'
import * as v2exClient from '@/utils/v2ex-client'
import { BalanceBrief, MemberDetail } from '@/utils/v2ex-client/types'

import { useAlertService } from '../AlertService'

// Custom hooks for better organization
function useDailySignIn(user: MemberDetail | null) {
  const dailySigning = useRef(false)
  const alert = useAlertService()

  const dailySignIn = useCallback(
    async (u: MemberDetail) => {
      if (u && !dailySigning.current) {
        const todayKey = `$app$/daily_sign_in/${u.username}/${getUTCDateString()}`
        if (typeof storage.getAllKeys === 'function') {
          const prefix = `$app$/daily_sign_in/${u.username}/`
          storage.getAllKeys().forEach((key) => {
            if (key.startsWith(prefix) && key !== todayKey) {
              storage.remove(key)
            }
          })
        }
        if (!getJSON(todayKey)) {
          try {
            dailySigning.current = true
            await v2exClient.dailySignin()
            setJSON(todayKey, 1)
            alert.show({ type: 'success', message: '签到成功' })
          } catch (err) {
            if (err.code === 'DAILY_SIGNED') {
              setJSON(todayKey, 1)
              alert.show({
                type: 'info',
                message: err.message,
              })
            } else {
              alert.show({ type: 'error', message: err.message })
            }
          } finally {
            dailySigning.current = false
          }
        }
      }
    },
    [alert],
  )

  // Auto sign-in on app becoming active
  useEffect(() => {
    if (!user) return

    let appState = AppState.currentState
    let timer: NodeJS.Timeout
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (appState.match(/background/) && nextAppState === 'active') {
        timer = setTimeout(() => {
          InteractionManager.runAfterInteractions(async () => {
            try {
              await dailySignIn(user)
              // fetch index
              v2exClient.getHomeFeeds({ tab: 'recent' }).catch((err) => {
                // do nothing.
              })
            } catch (err) { }
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
  }, [user, dailySignIn])

  return dailySignIn
}

function useAuthSubscriptions(
  user: MemberDetail | null,
  fetchCurrentUser: () => Promise<MemberDetail | undefined>,
  setAuthState: (updater: (prev: AuthState) => AuthState) => void,
  isFetchingUserRef: React.MutableRefObject<boolean>,
) {
  // Handle current user mismatch
  useEffect(() => {
    const unsubscribe = v2exClient.subscribe(
      'current_user',
      async (username) => {
        if (isFetchingUserRef.current) return
        if (user?.username !== username) {
          isFetchingUserRef.current = true
          fetchCurrentUser()
            .then(() => {
              isFetchingUserRef.current = false
            })
            .catch(() => {
              isFetchingUserRef.current = false
            })
        }
      },
    )
    return unsubscribe
  }, [user, fetchCurrentUser, isFetchingUserRef])

  // Handle unread count updates
  useEffect(() => {
    const unsubscribe = v2exClient.subscribe('unread_count', (val: number) => {
      setAuthState((prev) => {
        const current_unread_count = prev.meta?.unread_count
        if (current_unread_count === val) return prev
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
  }, [setAuthState])

  // Handle balance updates
  useEffect(() => {
    const unsubscribe = v2exClient.subscribe(
      'balance_brief',
      (balanceBrief: BalanceBrief) => {
        setAuthState((prev) => ({
          ...prev,
          meta: {
            ...prev.meta,
            balance: balanceBrief,
          },
        }))
      },
    )
    return unsubscribe
  }, [setAuthState])
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



export default function AuthWatcher() {
  const isFetchingUserRef = useRef(false)

  const { user, fetchedAt, fetchCurrentUser, setAuthState } = useAuthStore(
    useShallow((state) => ({
      user: state.user,
      fetchedAt: state.fetchedAt,
      fetchCurrentUser: state.fetchCurrentUser,
      setAuthState: state.setAuthState,
    })),
  )

  // Initialize hooks
  const dailySignIn = useDailySignIn(user)
  useAuthSubscriptions(user, fetchCurrentUser, setAuthState, isFetchingUserRef)

  // Initial user fetch
  useEffect(() => {
    fetchCurrentUser().then((res) => {
      // Perform initial daily sign-in check
      if (res && shouldCheck(fetchedAt)) {
        dailySignIn(res)
      } else if (res) {
        dailySignIn(res)
      }
    })
  }, []) // Only run once on mount

  return null
}
