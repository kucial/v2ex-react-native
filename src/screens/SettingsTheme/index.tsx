import { useEffect, useState } from 'react'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'

import AlertService from '@/containers/AlertService'
import { useAppSettings } from '@/containers/AppSettingsService'
import { ThemeProvider, useColorScheme } from '@/containers/ThemeService'

import ThemePreview from './ThemePreview'

type ScreenProps = NativeStackScreenProps<AppStackParamList, 'theme-settings'>
export default function SettingsTheme(props: ScreenProps) {
  const { navigation } = props
  const {
    data: { theme, fontScale },
    update,
  } = useAppSettings()
  const [preview, setPreview] = useState(theme)
  const [scale, setScale] = useState(fontScale)
  const { colorScheme: currentScheme } = useColorScheme()
  const [colorScheme, setColorScheme] = useState(currentScheme)

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', () => {
      if (preview !== theme || scale !== fontScale) {
        update((prev) => ({
          ...prev,
          theme: preview,
          fontScale: scale,
        }))
      }
    })
    return unsubscribe
  }, [navigation, theme, preview, scale])

  return (
    <ThemeProvider theme={preview} fontScale={scale} colorScheme={colorScheme}>
      <AlertService>
        <ThemePreview
          navigation={props.navigation}
          theme={preview}
          fontScale={scale}
          setTheme={setPreview}
          setFontScale={setScale}
          colorScheme={colorScheme}
          setColorScheme={setColorScheme}
        />
      </AlertService>
    </ThemeProvider>
  )
}
