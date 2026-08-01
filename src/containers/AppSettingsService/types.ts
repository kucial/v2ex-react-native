import { HomeTabOption } from '@/utils/v2ex-client/types'

export type AppSettings = {
  homeTabs?: HomeTabOption[]
  showHasViewed: boolean
  showHasNewReply: boolean
  autoScrollToLastPosition: boolean
  colorScheme?: 'light' | 'dark' | 'system'
  theme: string
  lightTheme?: string
  darkTheme?: string
  pureDarkTheme: boolean
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

  // reply form.
  enableMultiMention?: boolean

  maxContainerWidth: number
  googleSigninEnabled?: boolean
  payLayoutEnabled?: boolean

  searchProvider: SearchProvider
  historyRecordLimit: number

  /** Opt-out for anonymous usage analytics. Gates the whole tracking layer. */
  trackingEnabled: boolean
}

export type SearchProvider = 'google' | 'sov2ex'
export type FeedTitleStyle = 'normal' | 'emphasized'
export type FeedLayoutStyle = 'normal' | 'tide'
