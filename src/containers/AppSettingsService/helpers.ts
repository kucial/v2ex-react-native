import { getJSON } from '@/utils/storage'

import { CACHE_KEY, DEFAULT_SETTINGS } from './constants'

export const getActiveTheme = () => {
  const settings = getJSON(CACHE_KEY)
  return settings?.theme || DEFAULT_SETTINGS.theme
}

export const getActiveFontScale = () => {
  const settings = getJSON(CACHE_KEY)
  return settings?.fontScale || DEFAULT_SETTINGS.fontScale
}
