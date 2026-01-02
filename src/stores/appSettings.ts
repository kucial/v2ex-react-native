import { SetStateAction } from 'react'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import {
  CACHE_KEY,
  DEFAULT_SETTINGS,
} from '@/containers/AppSettingsService/constants'
import { AppSettings } from '@/containers/AppSettingsService/types'
import { useAuthStore } from '@/stores/auth'
import { remoteDevtools } from '@/utils/remoteDevtools'
import { stateStorage } from '@/utils/storage'
import * as v2exClient from '@/utils/v2ex-client'
import { HomeTabOption } from '@/utils/v2ex-client/types'

const RECENT_TAB: HomeTabOption = {
  value: 'recent',
  label: '最近',
  type: 'home',
}
const TODAY_HOT_TAB: HomeTabOption = {
  value: 'today_hots',
  label: '今日热议',
  type: 'home',
  disabled: true,
}
const PLANET_TAB: HomeTabOption = {
  value: 'planet',
  label: 'Planet',
  type: 'planet',
}

type AppSettingsStore = {
  data: AppSettings
  update: (value: SetStateAction<AppSettings>) => void
  initHomeTabs: () => Promise<HomeTabOption[]>
}

const ensureHomeTabs = (tabs?: HomeTabOption[]) => {
  if (!tabs) {
    return tabs
  }
  const hasTodayHot = tabs.some(
    (item) =>
      item.type === TODAY_HOT_TAB.type && item.value === TODAY_HOT_TAB.value,
  )
  return hasTodayHot ? tabs : [...tabs, TODAY_HOT_TAB]
}

const normalizeSettings = (data?: Partial<AppSettings>) => {
  const merged = {
    ...DEFAULT_SETTINGS,
    ...(data ?? {}),
  }
  const lightTheme = merged.lightTheme || merged.theme || DEFAULT_SETTINGS.theme
  const darkTheme = merged.darkTheme || merged.theme || DEFAULT_SETTINGS.theme
  return {
    ...merged,
    lightTheme,
    darkTheme,
    homeTabs: ensureHomeTabs(merged.homeTabs),
  }
}

const uniqueTabs = (tabs: HomeTabOption[]) => {
  const seen = new Set<string>()
  const deduped: HomeTabOption[] = []
  tabs.forEach((tab) => {
    const key = `${tab.type ?? ''}:${tab.value}`
    if (!seen.has(key)) {
      seen.add(key)
      deduped.push(tab)
    }
  })
  return deduped
}

const getPersistedSettings = (persistedState: unknown) => {
  if (!persistedState || typeof persistedState !== 'object') {
    return undefined
  }
  if ('data' in persistedState) {
    return (persistedState as { data?: AppSettings }).data
  }
  return persistedState as AppSettings
}

export const useAppSettingsStore = create<AppSettingsStore>()(
  remoteDevtools(
    persist(
      (set) => ({
        data: normalizeSettings(),
        update: (value) =>
          set(
            (state) => {
              const next =
                typeof value === 'function' ? value(state.data) : value
              return {
                data: normalizeSettings(next),
              }
            },
            false,
            { type: 'update' },
          ),
        initHomeTabs: async () => {
          const { data } = await v2exClient.getHomeTabs()
          let collectedTabs: HomeTabOption[] = []
          const authUser = useAuthStore.getState().user
          if (authUser) {
            try {
              const collected = await v2exClient.getMyCollectedNodes()
              collectedTabs = collected.data.map((node) => ({
                value: node.name,
                label: node.title,
                type: 'node',
              }))
            } catch (err) {
              console.log('Failed to load collected nodes', err)
            }
          }
          const mapped = uniqueTabs(
            [
              RECENT_TAB,
              TODAY_HOT_TAB,
              PLANET_TAB,
              ...data,
              ...collectedTabs,
            ].filter((item) => item.value !== 'nodes'),
          )
          set(
            (state) => ({
              data: normalizeSettings({
                ...state.data,
                homeTabs: mapped,
              }),
            }),
            false,
            { type: 'initHomeTabs' },
          )
          return mapped
        },
      }),
      {
        name: CACHE_KEY,
        storage: createJSONStorage(() => stateStorage),
        partialize: (state) => state.data,
        merge: (persistedState, currentState) => ({
          ...currentState,
          data: normalizeSettings(
            getPersistedSettings(persistedState) ?? currentState.data,
          ),
        }),
      },
    ),
    {
      name: 'app-settings-store',
    },
  ),
)

let authSubscriptionInitialized = false
const initAuthSubscription = () => {
  if (authSubscriptionInitialized) {
    return
  }
  authSubscriptionInitialized = true
  useAuthStore.subscribe((state, prevState) => {
    const nextUserId = state.user?.id ?? null
    const prevUserId = prevState.user?.id ?? null
    if (nextUserId && nextUserId !== prevUserId) {
      useAppSettingsStore
        .getState()
        .initHomeTabs()
        .catch((err) => {
          console.log('Failed to init home tabs after login', err)
        })
    }
  })
}

initAuthSubscription()
