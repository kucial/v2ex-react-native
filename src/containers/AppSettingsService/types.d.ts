import { SetStateAction } from 'react'

import { HomeTabOption } from '@/utils/v2ex-client/types'

type AppSettings = {
  homeTabs?: HomeTabOption[]
  showHasViewed: boolean
  showHasNewReply: boolean
  colorScheme?: 'light' | 'dark' | 'system'
  theme: string
  fontScale: number
  // themeColor: '',
  feedLayout: FeedLayoutStyle
  feedShowAvatar: boolean
  feedShowLastReplyMember: boolean
  feedShowViewedHint: boolean
  feedTitleStyle: FeedTitleStyle
  autoRefresh: boolean
  autoRefreshDuration: number // minutes
  refreshHaptics?: boolean

  maxContainerWidth: number
  googleSigninEnabled?: boolean
  payLayoutEnabled?: boolean

  searchProvider: SearchProvider
  historyRecordLimit: number
}

type AppSettingsService = {
  data: AppSettings
  update: (value: SetStateAction<AppSettings>) => void
  staticUpdate: (value: AppSettings) => void
  initHomeTabs: () => Promise<HomeTabOption[]>
}

export type SearchProvider = 'google' | 'sov2ex'
export type FeedTitleStyle = 'normal' | 'emphasized'
export type FeedLayoutStyle = 'normal' | 'tide'
