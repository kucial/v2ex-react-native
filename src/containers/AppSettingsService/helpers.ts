import { getJSON } from '@/utils/storage'

import { CACHE_KEY, DEFAULT_SETTINGS } from './constants'

export const getActiveTheme = () => {
  const settings = getJSON(CACHE_KEY)
  return settings?.theme || DEFAULT_SETTINGS.theme
}
