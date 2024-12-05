import { ReactNode, useContext, useEffect, useMemo } from 'react'
import { Platform } from 'react-native'
import { getAppIcon, setAppIcon } from 'expo-dynamic-app-icon'
import * as NavigationBar from 'expo-navigation-bar'
import * as SystemUI from 'expo-system-ui';

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
    if (Platform.OS == 'android') {
      NavigationBar.setBackgroundColorAsync(service.theme.colors.bg_overlay)
      NavigationBar.setButtonStyleAsync(service.theme.dark ? 'light' : 'dark')
      SystemUI.setBackgroundColorAsync(service.theme.colors.bg_overlay)
    }
    if (Platform.OS == 'ios') {
      const iconName = `${themeName}_${service.colorScheme}`
      if (iconName !== getAppIcon()) {
        setAppIcon(iconName)
      }
    }
  }, [service, themeName])

  return (
    <ThemeContext.Provider value={service}>
      {props.children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
