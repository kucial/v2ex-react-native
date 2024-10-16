import { ReactElement, useMemo } from 'react'

import { useCachedState } from '@/utils/hooks'
import { setJSON } from '@/utils/storage'
import * as v2exClient from '@/utils/v2ex-client'
import { HomeTabOption } from '@/utils/v2ex-client/types'

import { CACHE_KEY, DEFAULT_SETTINGS } from './constants'
import { AppSettingsContext } from './context'
import { AppSettings, AppSettingsService } from './types'

const TODAY_HOT_TAB: HomeTabOption = {
  value: 'today_hots',
  label: '今日热议',
  type: 'home',
  disabled: true,
}

export default function AppSettingsServiceProvider(props: {
  children: ReactElement
}) {
  const [settings, setSettings] = useCachedState<AppSettings>(
    CACHE_KEY,
    undefined,
    (data = {}) => {
      const merged = {
        ...DEFAULT_SETTINGS,
        ...data,
      }
      if (
        merged.homeTabs &&
        merged.homeTabs.findIndex(
          (item: HomeTabOption) =>
            item.type === TODAY_HOT_TAB.type &&
            item.value === TODAY_HOT_TAB.value,
        ) === -1
      ) {
        merged.homeTabs.push(TODAY_HOT_TAB)
      }
      return merged
    },
  )

  const service = useMemo(() => {
    return {
      data: settings,
      update: setSettings,
      staticUpdate: (data) => setJSON(CACHE_KEY, data),
      initHomeTabs: async () => {
        const { data } = await v2exClient.getHomeTabs()
        const mapped: HomeTabOption[] = [
          {
            value: 'recent',
            label: '最近',
            type: 'home',
          } as HomeTabOption,
          TODAY_HOT_TAB,
          ...data,
        ].filter((item) => item.value !== 'nodes')
        setSettings((prev) => ({
          ...prev,
          homeTabs: mapped,
        }))
        return mapped
      },
    } as AppSettingsService
  }, [settings])

  return (
    <AppSettingsContext.Provider value={service}>
      {props.children}
    </AppSettingsContext.Provider>
  )
}
