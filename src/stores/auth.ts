import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { useShallow } from 'zustand/react/shallow'

import { remoteDevtools } from '@/utils/remoteDevtools'
import { stateStorage } from '@/utils/storage'
import * as v2exClient from '@/utils/v2ex-client'
import { BalanceBrief, MemberDetail } from '@/utils/v2ex-client/types'

export const AUTH_CACHE_KEY = '$app$/current-user'

export interface MemberMeta {
  unread_count: number
  balance?: BalanceBrief
}

export interface AuthState {
  error?: Error
  user: MemberDetail | null
  meta?: MemberMeta | null
  status: string
  fetchedAt?: number
}


export type AuthStatus =
  | 'none'
  | 'loading'
  | 'authed'
  | 'visitor'
  | 'failed'
  | 'logout'
  | 'logging-out'
  | 'logout-failed'

export type AuthStateWithMeta = AuthState & {
  fetchedAt?: number
  status: AuthStatus
}

export const INIT_AUTH_STATE: AuthStateWithMeta = {
  user: null,
  meta: null,
  status: 'none',
  fetchedAt: undefined,
}

type AuthStore = AuthStateWithMeta & {
  nextAction?: VoidFunction
  setNextAction: (action?: VoidFunction) => void
  popNextAction: () => VoidFunction | undefined
  setAuthState: (
    updater: (prev: AuthStateWithMeta) => AuthStateWithMeta,
  ) => void
  updateMeta: (patch: MemberMeta) => void
  fetchCurrentUser: () => Promise<MemberDetail | undefined>
  logout: (onError?: (err: Error) => void) => Promise<void>
}

export const useAuthStore = create<AuthStore>()(
  remoteDevtools(
    persist(
      (set, get) => ({
        ...INIT_AUTH_STATE,
        nextAction: undefined,

        setNextAction: (action) => set({ nextAction: action }, false),

        popNextAction: () => {
          const action = get().nextAction
          if (action) {
            set({ nextAction: undefined }, false)
            return action
          }
          return undefined
        },

        setAuthState: (updater) => set((state) => updater(state)),

        updateMeta: (patch) =>
          set(
            (state) => {
              // Bail out if nothing actually changed — prevents unnecessary
              // re-renders in every component that reads `meta`.
              const prevMeta = state.meta
              const keys = Object.keys(patch) as (keyof MemberMeta)[]
              const hasChange = keys.some((k) => prevMeta?.[k] !== patch[k])
              if (!hasChange) return state

              return {
                meta: { ...prevMeta, ...patch },
              }
            },
            false,
            { type: 'updateMeta', payload: patch },
          ),

        fetchCurrentUser: async () => {
          // Only transition to 'loading' if we aren't already loading.
          // Prevents a redundant re-render when called multiple times.
          if (get().status !== 'loading') {
            set({ status: 'loading' })
          }

          try {
            const res = await v2exClient.getCurrentUser(true)
            const nextStatus = res.data ? 'authed' : 'visitor'

            // Single atomic set — only include fields that are changing.
            set({
              user: res.data,
              meta: res.meta,
              status: nextStatus,
              fetchedAt: Date.now(),
            })

            return res.data
          } catch (err) {
            console.log('.....AUTH_ERROR......', err)
            set({ status: 'failed' })
            throw err instanceof Error ? err : new Error(String(err))
          }
        },

        logout: async (onError) => {
          const prevStatus = get().status

          try {
            set({ status: 'logging-out' })
            const res = await v2exClient.logout()

            if (res.success) {
              // Single set for the full reset — one re-render, not N.
              set({
                user: INIT_AUTH_STATE.user,
                meta: INIT_AUTH_STATE.meta,
                status: 'logout',
                fetchedAt: undefined,
              })
            } else {
              // Logout API returned success: false — restore previous status
              set({ status: prevStatus })
            }
          } catch (err) {
            const error = err instanceof Error ? err : new Error(String(err))
            onError?.(error)
            set({
              status: prevStatus === 'authed' ? 'logout-failed' : prevStatus,
            })
          }
        },
      }),
      {
        name: AUTH_CACHE_KEY,
        storage: createJSONStorage(() => stateStorage),
        partialize: (state) => ({
          user: state.user,
          meta: state.meta,
          status: state.status,
          fetchedAt: state.fetchedAt,
        }),
        merge: (persistedState, currentState) => {
          const merged = {
            ...currentState,
            ...(persistedState as Partial<AuthStore>),
          }
          // Don't restore a stale 'loading' status from a previous session
          if (merged.status === 'loading' || merged.status === 'logging-out') {
            merged.status = 'none'
          }
          return merged
        },
      },
    ),
    {
      name: 'auth-store',
    },
  ),
)

// ─── Granular selectors ──────────────────────────────────────────────
// Use these instead of bare `useAuthStore()` to avoid re-renders from
// unrelated state changes.

/** Current user object — null when not authed */
export const useCurrentUser = () => useAuthStore((s) => s.user)

/** Auth status string only — won't re-render when user/meta change */
export const useAuthStatus = () => useAuthStore((s) => s.status)

/** Whether the user is fully authenticated */
export const useIsAuthed = () => useAuthStore((s) => s.status === 'authed')

/** Whether any auth operation is in progress */
export const useIsAuthLoading = () =>
  useAuthStore((s) => s.status === 'loading' || s.status === 'logging-out')

/** User meta (notifications, balance, etc.) */
export const useAuthMeta = () => useAuthStore((s) => s.meta)

/** Stable reference to actions only — never triggers re-renders from data changes */
export const useAuthActions = () =>
  useAuthStore(
    useShallow((s) => ({
      fetchCurrentUser: s.fetchCurrentUser,
      logout: s.logout,
      updateMeta: s.updateMeta,
      setAuthState: s.setAuthState,
      setNextAction: s.setNextAction,
      popNextAction: s.popNextAction,
    })),
  )

/**
 * For components that need both user + status (e.g. profile screens).
 * Still scoped — won't re-render when only `meta` or `fetchedAt` change.
 */
export const useAuth = () =>
  useAuthStore(
    useShallow((s) => ({
      user: s.user,
      status: s.status,
    })),
  )
