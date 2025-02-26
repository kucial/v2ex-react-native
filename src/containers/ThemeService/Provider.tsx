import { ReactNode, useContext, useEffect, useMemo } from 'react'
import { Platform } from 'react-native'
import { getAppIcon, setAppIcon } from 'expo-dynamic-app-icon'
import * as NavigationBar from 'expo-navigation-bar'
import * as SystemUI from 'expo-system-ui'

import { useAppSettings } from '../AppSettingsService'
import { ThemeContext } from './context'
import { getThemeService } from './helpers'
import { useColorScheme } from './hooks'

export const ThemeProvider = (props: {
  theme?: string
  fontScale?: number
  pureDarkTheme?: boolean
  colorScheme?: 'light' | 'dark'
  children: ReactNode
}) => {
  const { colorScheme } = useColorScheme()
  const {
    data: {
      theme: themeName,
      fontScale: defaultFontScale,
      pureDarkTheme: defaultPureDarkTheme,
    },
  } = useAppSettings()

  const activeTheme = props.theme ?? themeName
  const activeScheme = props.colorScheme || colorScheme
  const fontScale = props.fontScale ?? defaultFontScale
  const pureDarkTheme = props.pureDarkTheme ?? defaultPureDarkTheme

  const service = useMemo(
    () => getThemeService(activeTheme, activeScheme, fontScale, pureDarkTheme),
    [activeScheme, activeTheme, fontScale, pureDarkTheme],
  )

  useEffect(() => {
    if (Platform.OS == 'android') {
      NavigationBar.setBackgroundColorAsync(service.theme.colors.bg_overlay)
      NavigationBar.setButtonStyleAsync(service.theme.dark ? 'light' : 'dark')
      SystemUI.setBackgroundColorAsync(service.theme.colors.bg_overlay)
    }
    if (Platform.OS == 'ios') {
      setAppIcon(themeName)
    }
  }, [service, themeName])

  return (
    <ThemeContext.Provider value={service}>
      {props.children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
