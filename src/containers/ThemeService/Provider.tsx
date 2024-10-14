import { ReactNode, useContext, useEffect, useMemo } from 'react'
import * as NavigationBar from 'expo-navigation-bar'

import { useAppSettings } from '../AppSettingsService'
import { ThemeContext } from './context'
import { getThemeService } from './helpers'
import { useColorScheme } from './hooks'

export const ThemeProvider = (props: {
  theme?: string
  fontScale?: number
  colorScheme?: 'light' | 'dark'
  children: ReactNode
}) => {
  const { colorScheme } = useColorScheme()
  const {
    data: { theme: themeName, fontScale: defaultFontScale },
  } = useAppSettings()

  const activeTheme = props.theme ?? themeName
  const activeScheme = props.colorScheme || colorScheme
  const fontScale = props.fontScale ?? defaultFontScale

  const service = useMemo(
    () => getThemeService(activeTheme, activeScheme, fontScale),
    [activeScheme, activeTheme, fontScale],
  )

  useEffect(() => {
    NavigationBar.setBackgroundColorAsync(service.theme.colors.bg_overlay)
  }, [service])

  return (
    <ThemeContext.Provider value={service}>
      {props.children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
