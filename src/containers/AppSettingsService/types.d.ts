import { SetStateAction } from 'react'
import { HomeTabOption } from '@/types/v2ex'

type AppSettings = {
  homeTabs?: HomeTabOption[],
  showHasViewed: boolean,
  showHasNewReply: boolean,
  colorScheme?: 'light' | 'dark' | 'auto',
  // @deprecate theme
  theme: 'light' | 'dark' | 'auto',
  // themeColor: '',
  feedLayout: 'normal' | 'tide',
  feedShowAvatar: boolean,
  feedShowLastReplyMember: boolean,
  feedShowViewedHint: boolean,
  autoRefresh: boolean,
  autoRefreshDuration: number, // minutes
}

type AppSettingsService = {
  data: AppSettings,
  update: (value: SetStateAction<AppSettings>) => void,
  initHomeTabs: () => Promise<HomeTabOption[]>
}