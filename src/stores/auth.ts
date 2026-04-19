import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import { AuthState, MemberMeta } from '@/containers/AuthService/types'
import { remoteDevtools } from '@/utils/remoteDevtools'
import { stateStorage } from '@/utils/storage'
import * as v2exClient from '@/utils/v2ex-client'
import { MemberDetail } from '@/utils/v2ex-client/types'

export const AUTH_CACHE_KEY = '$app$/current-user'

// FIX: Added 'logging-out' and 'logout-failed' as valid statuses
export type AuthStatus =
  | 'none'
  | 'loading'
  | 'authed'
  | 'visitor'
  | 'failed'
  | 'logout'
  | 'logging-out'
  | 'logout-failed'

// FIX: Added fetchedAt to AuthState so it's properly typed
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
  // nextAction is intentionally excluded from persistence (functions can't be serialized)
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
            (state) => ({
              ...state,
              meta: {
                ...state.meta,
                ...patch,
              },
            }),
            false,
            { type: 'updateMeta', payload: patch },
          ),
        fetchCurrentUser: async () => {
          set((state) => ({
            ...state,
            status: 'loading',
          }))
          try {
            const res = await v2exClient.getCurrentUser(true)
            set(() => ({
              user: res.data,
              meta: res.meta,
              status: res.data ? 'authed' : 'visitor',
              fetchedAt: Date.now(),
            }))
            return res.data
          } catch (err) {
            console.log('.....AUTH_ERROR......', err)
            set((state) => ({
              ...state,
              status: 'failed',
            }))
            // FIX: Re-throw so callers can handle the error directly
            throw err instanceof Error ? err : new Error(String(err))
          }
        },
        logout: async (onError) => {
          const prevStatus = get().status
          try {
            // FIX: Corrected typo 'logingout' → 'logging-out'
            set((state) => ({
              ...state,
              status: 'logging-out',
            }))
            const res = await v2exClient.logout()
            if (res.success) {
              set(() => ({
                ...INIT_AUTH_STATE,
                status: 'logout',
              }))
            }
          } catch (err) {
            // FIX: Properly coerce unknown err to Error before passing to callback
            const error = err instanceof Error ? err : new Error(String(err))
            onError?.(error)
            // FIX: Use 'logout-failed' instead of silently restoring previous status,
            // which could mislead UI into showing an authenticated state after a failed logout
            set((state) => ({
              ...state,
              status: prevStatus === 'authed' ? 'logout-failed' : prevStatus,
            }))
          }
        },
      }),
      {
        name: AUTH_CACHE_KEY,
        storage: createJSONStorage(() => stateStorage),
        // Note: nextAction is intentionally omitted here — functions can't be JSON-serialized
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
          if (merged.status === 'loading') {
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

export const useCurrentUser = () => useAuthStore((state) => state.user)
