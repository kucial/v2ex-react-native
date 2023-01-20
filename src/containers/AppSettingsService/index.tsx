import { createContext, useContext, useMemo } from 'react'

import * as v2exClient from '@/utils/v2ex-client'
import { AppSettings, AppSettingsService } from './types'
import { HomeTabOption } from '@/types/v2ex'
import { useCachedState } from '@/utils/hooks'

const CACHE_KEY = '$app$/settings'

const DEFAULT_SETTINGS: AppSettings = {
  homeTabs: undefined, // Array<TabDesc>
  showHasViewed: true,
  showHasNewReply: true,

  theme: 'auto', // 'light' | 'dark' | 'auto'
  // themeColor: '', // 主题强调色
  feedLayout: 'normal', // normal | tide
  feedShowAvatar: true,
  feedShowLastReplyMember: true,
  feedShowViewedHint: true,

  autoRefresh: true,
  autoRefreshDuration: 10,
  // 刷新震动反馈
  hapticsHint: true,
}

const AppSettingsContext = createContext<AppSettingsService>(
  {} as AppSettingsService,
)

export const useAppSettings = () => useContext(AppSettingsContext)

export default function AppSettingsServiceProvider(props) {
  const [settings, setSettings] = useCachedState<AppSettings>(
    CACHE_KEY,
    undefined,
    (data = {}) => ({
      ...DEFAULT_SETTINGS,
      ...data,
    }),
  )

  const service = useMemo(() => {
    return {
      data: settings,
      update: setSettings,
      initHomeTabs: async () => {
        const { data } = await v2exClient.getHomeTabs()
        const mapped: HomeTabOption[] = [
          {
            value: 'recent',
            label: '最近',
            type: 'home',
          },
          ...data,
        ]
          .filter((item) => item.value !== 'nodes')
          .map((item) => ({ ...item, type: 'home' }))
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
