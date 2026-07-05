import { ReactNode, useContext, useEffect, useMemo } from 'react'
import { AppState, Platform } from 'react-native'
import { getAppIcon, setAppIcon } from '@howincodes/expo-dynamic-app-icon'
import * as NavigationBar from 'expo-navigation-bar'
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as NavigationThemeProvider,
} from 'expo-router/react-navigation'
import * as SystemUI from 'expo-system-ui'

import { useAppSettings } from '../AppSettingsService'
import { ThemeContext } from './context'
import { getThemeService } from './helpers'
import { useColorScheme } from './hooks'

// Themes that ship an alternate Icon Composer bundle
// (src/assets/icons/composer/AppIcon-<theme>.icon, wired up by
// plugins/withAlternateAppIcons). `r2v` is the primary icon.
const ICON_THEMES = new Set([
  'gin_blue',
  'gin_dark_purple',
  'gin_purple',
  'gin_green',
  'gin_teal',
  'gin_red',
  'gin_orange',
  'gin_yellow',
  'gin_pink',
])

async function syncAppIconWithTheme(themeName: string) {
  const target = ICON_THEMES.has(themeName) ? themeName : null
  const current = await getAppIcon()
  if ((current === 'DEFAULT' ? null : current) !== target) {
    await setAppIcon(target, true)
  }
}

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

  const activeScheme =
    props.colorScheme ?? (colorScheme === 'dark' ? 'dark' : 'light')
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
      NavigationBar.setStyle(service.theme.dark ? 'light' : 'dark')
      SystemUI.setBackgroundColorAsync(service.theme.colors.bg_overlay)
    }
  }, [service])

  useEffect(() => {
    if (Platform.OS !== 'ios') {
      return
    }
    // Apply the icon only while the app is in the background: iOS shows a
    // "You have changed the icon" alert when the change happens in the
    // foreground (the old private-API silencing no longer works on iOS 26).
    const subscription = AppState.addEventListener('change', (state) => {
      syncAppIconWithTheme(themeName).catch(() => {
        // alternate icons unavailable (e.g. outdated native build) — ignore
      })
    })
    return () => {
      subscription.remove()
    }
  }, [themeName])

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
