import { getJSON } from '@/utils/storage'

import { CACHE_KEY, DEFAULT_SETTINGS } from './constants'

export const getActiveTheme = () => {
  const settings = getJSON(CACHE_KEY)
  const data = settings?.data ?? settings
  return data?.theme || DEFAULT_SETTINGS.theme
}

export const getActiveFontScale = () => {
  const settings = getJSON(CACHE_KEY)
  const data = settings?.data ?? settings
  return data?.fontScale || DEFAULT_SETTINGS.fontScale
}
export const getUsePureDarkTheme = () => {
  const settings = getJSON(CACHE_KEY)
  const data = settings?.data ?? settings
  return data?.pureDarkTheme || DEFAULT_SETTINGS.pureDarkTheme
}
