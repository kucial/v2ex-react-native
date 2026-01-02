import { getJSON } from '@/utils/storage'

import { CACHE_KEY, DEFAULT_SETTINGS } from './constants'

export const getActiveTheme = (scheme?: 'light' | 'dark' | null) => {
  const settings = getJSON(CACHE_KEY)
  const data = settings?.data ?? settings
  if (scheme === 'dark') {
    return data?.darkTheme || data?.theme || DEFAULT_SETTINGS.theme
  }
  if (scheme === 'light') {
    return data?.lightTheme || data?.theme || DEFAULT_SETTINGS.theme
  }
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
