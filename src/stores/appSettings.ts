import { SetStateAction } from 'react'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import {
  CACHE_KEY,
  DEFAULT_SETTINGS,
} from '@/containers/AppSettingsService/constants'
import { AppSettings } from '@/containers/AppSettingsService/types'
import { remoteDevtools } from '@/utils/remoteDevtools'
import { stateStorage } from '@/utils/storage'
import * as v2exClient from '@/utils/v2ex-client'
import { HomeTabOption } from '@/utils/v2ex-client/types'

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
  return {
    ...merged,
    homeTabs: ensureHomeTabs(merged.homeTabs),
  }
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
          const mapped: HomeTabOption[] = [
            {
              value: 'recent',
              label: '最近',
              type: 'home',
            } as HomeTabOption,
            TODAY_HOT_TAB,
            PLANET_TAB,
            ...data,
          ].filter((item) => item.value !== 'nodes')
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
