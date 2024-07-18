import { AppSettings } from './types'

export const CACHE_KEY = '$app$/settings'
export const DEFAULT_SETTINGS: AppSettings = {
  homeTabs: undefined, // Array<TabDesc>
  showHasViewed: true,
  showHasNewReply: true,

  theme: 'r2v',
  fontScale: 1,
  // themeColor: '', // 主题强调色
  feedLayout: 'normal', // normal | tide
  feedShowAvatar: true,
  feedShowLastReplyMember: true,
  feedShowViewedHint: true,
  feedTitleStyle: 'normal', // normal | emphasized

  autoRefresh: true,
  autoRefreshDuration: 10,
  refreshHaptics: true,

  maxContainerWidth: 600,
  payLayoutEnabled: true,

  searchProvider: 'google',
  historyRecordLimit: 500,
}
