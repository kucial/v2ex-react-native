import { createContext, useContext, useEffect, useMemo, useState } from 'react'

import fetcher from '@/utils/fetcher'
import { getJSON, setJSON } from '@/utils/storage'

const CACHE_KEY = '$app$/settings'

const DEFAULT_SETTINGS = {
  homeTabs: undefined, // Array<TabDesc>
  showHasViewed: true,

  theme: 'auto', // 'light' | 'dark' | 'auto'
  themeColor: '', // 主题强调色

  feedLayout: 'normal', // normal | tide
  feedShowAvatar: true,
  feedShowLastReplyMember: true,
  feedShowViewedHint: true
}

const AppSettingsContext = createContext({})

export const useAppSettings = () => useContext(AppSettingsContext)

export default function AppSettings(props) {
  const [settings, setSettings] = useState(() => {
    const data = getJSON(CACHE_KEY)
    return {
      ...DEFAULT_SETTINGS,
      ...(data || {})
    }
  })

  useEffect(() => {
    setJSON(CACHE_KEY, settings)
  }, [settings])

  const service = useMemo(() => {
    return {
      data: settings,
      update: setSettings,
      initHomeTabs: async () => {
        const data = await fetcher('/page/index/tabs.json')
        const mapped = [
          {
            value: 'recent',
            label: '最近'
          },
          ...data
        ]
          .filter((item) => item.value !== 'nodes')
          .map((item) => ({ ...item, type: 'home' }))
        setSettings((prev) => ({
          ...prev,
          homeTabs: mapped
        }))
      }
    }
  }, [settings])

  return (
    <AppSettingsContext.Provider value={service}>
      {props.children}
    </AppSettingsContext.Provider>
  )
}
