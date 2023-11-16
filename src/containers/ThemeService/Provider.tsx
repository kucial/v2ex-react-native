import { ReactNode, useContext, useMemo } from 'react'

import { useAppSettings } from '../AppSettingsService'
import { ThemeContext } from './context'
import { getThemeService } from './helpers'
import { useColorScheme } from './hooks'

export const ThemeProvider = (props: {
  theme?: string
  colorScheme?: 'light' | 'dark'
  children: ReactNode
}) => {
  const { colorScheme } = useColorScheme()
  const {
    data: { theme: themeName },
  } = useAppSettings()

  const activeTheme = props.theme ?? themeName
  const activeScheme = props.colorScheme || colorScheme

  const service = useMemo(
    () => getThemeService(activeTheme, activeScheme),
    [activeScheme, activeTheme],
  )

  return (
    <ThemeContext.Provider value={service}>
      {props.children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
