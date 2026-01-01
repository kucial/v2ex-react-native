import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import { AuthState, MemberMeta } from '@/containers/AuthService/types'
import { remoteDevtools } from '@/utils/remoteDevtools'
import { stateStorage } from '@/utils/storage'
import * as v2exClient from '@/utils/v2ex-client'
import { MemberDetail } from '@/utils/v2ex-client/types'

export const AUTH_CACHE_KEY = '$app$/current-user'

export const INIT_AUTH_STATE: AuthState = {
  user: null,
  meta: null,
  status: 'none', // 'loading' | 'authed' | 'visitor' | failed' | 'logout' | 'none',
}

type AuthStore = AuthState & {
  setAuthState: (updater: (prev: AuthState) => AuthState) => void
  updateMeta: (patch: MemberMeta) => void
  fetchCurrentUser: () => Promise<MemberDetail | undefined>
  logout: (onError?: (err: Error) => void) => Promise<void>
}

export const useAuthStore = create<AuthStore>()(
  remoteDevtools(
    persist(
      (set, get) => ({
        ...INIT_AUTH_STATE,
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
          }
        },
        logout: async (onError) => {
          const prevStatus = get().status
          try {
            set((state) => ({
              ...state,
              status: 'logingout',
            }))
            const res = await v2exClient.logout()
            if (res.success) {
              set(() => ({
                ...INIT_AUTH_STATE,
                status: 'logout',
              }))
            }
          } catch (err) {
            onError?.(err)
            set((state) => ({
              ...state,
              status: prevStatus,
            }))
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
