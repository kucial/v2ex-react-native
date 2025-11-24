import { useEffect, useState } from 'react'
import { View } from 'react-native'
import { useNavigation } from 'expo-router'

import NavigationHeader from '@/components/NavigationHeader'

import AlertService from '@/containers/AlertService'
import { useAppSettings } from '@/containers/AppSettingsService'
import { ThemeProvider, useColorScheme } from '@/containers/ThemeService'

import ThemePreview from './ThemePreview'

export default function SettingsTheme() {
  const navigation = useNavigation()
  const {
    data: { theme, fontScale, pureDarkTheme },
    update,
  } = useAppSettings()
  const [preview, setPreview] = useState(theme)
  const [scale, setScale] = useState(fontScale)
  const { colorScheme: currentScheme } = useColorScheme()
  const [colorScheme, setColorScheme] = useState(currentScheme)
  const [pureDark, setPureDark] = useState(pureDarkTheme)

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', () => {
      if (
        preview !== theme ||
        scale !== fontScale ||
        pureDark !== pureDarkTheme
      ) {
        update((prev) => ({
          ...prev,
          theme: preview,
          fontScale: scale,
          pureDarkTheme: pureDark,
        }))
      }
    })
    return unsubscribe
  }, [
    navigation,
    theme,
    preview,
    scale,
    pureDark,
    fontScale,
    pureDarkTheme,
    update,
  ])

  return (
    <ThemeProvider
      theme={preview}
      fontScale={scale}
      colorScheme={colorScheme}
      pureDarkTheme={pureDark}
    >
      <AlertService>
        <View className='flex-1'>
          <NavigationHeader canGoBack title='主题样式' />
          <ThemePreview
            theme={preview}
            fontScale={scale}
            pureDarkTheme={pureDark}
            setTheme={setPreview}
            setFontScale={setScale}
            setPureDarkTheme={setPureDark}
            colorScheme={colorScheme}
            setColorScheme={setColorScheme}
          />
        </View>
      </AlertService>
    </ThemeProvider>
  )
}
