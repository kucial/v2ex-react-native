import { ReactNode, useContext, useEffect, useMemo } from 'react'
import { Platform } from 'react-native'
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as NavigationThemeProvider,
} from '@react-navigation/native'
import * as NavigationBar from 'expo-navigation-bar'
import { StatusBar } from 'expo-status-bar'
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
      lightTheme,
      darkTheme,
      fontScale: defaultFontScale,
      pureDarkTheme: defaultPureDarkTheme,
    },
  } = useAppSettings()

  const activeScheme = props.colorScheme || colorScheme
  const activeTheme =
    props.theme ??
    (activeScheme === 'dark' ? darkTheme : lightTheme) ??
    themeName
  const fontScale = props.fontScale ?? defaultFontScale
  const pureDarkTheme = props.pureDarkTheme ?? defaultPureDarkTheme

  const service = useMemo(
    () => getThemeService(activeTheme, activeScheme, fontScale, pureDarkTheme),
    [activeScheme, activeTheme, fontScale, pureDarkTheme],
  )
  useEffect(() => {
    if (Platform.OS === 'android') {
      NavigationBar.setBackgroundColorAsync(service.theme.colors.bg_overlay)
      NavigationBar.setButtonStyleAsync(service.theme.dark ? 'light' : 'dark')
      SystemUI.setBackgroundColorAsync(service.theme.colors.bg_overlay)
    }
  }, [service])

  const theme = useMemo(() => {
    if (activeScheme === 'dark') {
      return {
        ...DarkTheme,
        ...service.theme,
      }
    }
    return {
      ...DefaultTheme,
      ...service.theme,
    }
  }, [service.theme, activeScheme])

  return (
    <ThemeContext.Provider value={service}>
      <NavigationThemeProvider value={theme}>
        {props.children}
      </NavigationThemeProvider>
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
