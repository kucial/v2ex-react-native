import { useEffect, useState } from 'react'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'

import { useAppSettings } from '@/containers/AppSettingsService'
import { ThemeProvider, useColorScheme } from '@/containers/ThemeService'

import ThemePreview from './ThemePreview'

type ScreenProps = NativeStackScreenProps<AppStackParamList, 'theme-settings'>
export default function SettingsTheme(props: ScreenProps) {
  const { navigation } = props
  const {
    data: { theme },
    update,
  } = useAppSettings()
  const [preview, setPreview] = useState(theme)
  const { colorScheme: currentScheme } = useColorScheme()
  const [colorScheme, setColorScheme] = useState(currentScheme)

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', () => {
      if (preview !== theme) {
        update((prev) => ({
          ...prev,
          theme: preview,
        }))
      }
    })
    return unsubscribe
  }, [navigation, theme, preview])

  return (
    <ThemeProvider theme={preview} colorScheme={colorScheme}>
      <ThemePreview
        navigation={props.navigation}
        theme={preview}
        setTheme={setPreview}
        colorScheme={colorScheme}
        setColorScheme={setColorScheme}
      />
    </ThemeProvider>
  )
}
