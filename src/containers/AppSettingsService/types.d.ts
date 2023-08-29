import { SetStateAction } from 'react'

import { HomeTabOption } from '@/utils/v2ex-client/types'

type AppSettings = {
  homeTabs?: HomeTabOption[]
  showHasViewed: boolean
  showHasNewReply: boolean
  colorScheme?: 'light' | 'dark' | 'system'
  theme: string
  // themeColor: '',
  feedLayout: 'normal' | 'tide'
  feedShowAvatar: boolean
  feedShowLastReplyMember: boolean
  feedShowViewedHint: boolean
  feedTitleStyle: 'normal' | 'emphasized'
  autoRefresh: boolean
  autoRefreshDuration: number // minutes
  refreshHaptics?: boolean

  maxContainerWidth: number
  googleSigninEnabled?: boolean
  payLayoutEnabled?: boolean

  searchProvider: 'google' | 'sov2ex'
}

type AppSettingsService = {
  data: AppSettings
  update: (value: SetStateAction<AppSettings>) => void
  staticUpdate: (value: AppSettings) => void
  initHomeTabs: () => Promise<HomeTabOption[]>
}
