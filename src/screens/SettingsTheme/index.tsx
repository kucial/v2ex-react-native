import { useEffect, useState } from 'react'
import { StyleSheet, useColorScheme, View } from 'react-native'
import { useNavigation } from 'expo-router'

import NavigationHeader from '@/components/NavigationHeader'

import AlertService from '@/containers/AlertService'
import { useAppSettings } from '@/containers/AppSettingsService'
import { ThemeProvider } from '@/containers/ThemeService'

import ThemePreview from './ThemePreview'

export default function SettingsTheme() {
  const navigation = useNavigation()
  const {
    data: { theme, lightTheme, darkTheme, fontScale, pureDarkTheme },
    update,
  } = useAppSettings()
  const [previewLightTheme, setPreviewLightTheme] = useState(
    lightTheme || theme,
  )
  const [previewDarkTheme, setPreviewDarkTheme] = useState(darkTheme || theme)
  const [scale, setScale] = useState(fontScale)
  const { colorScheme: currentScheme } = useColorScheme()
  const [colorScheme, setColorScheme] = useState(currentScheme)
  const [pureDark, setPureDark] = useState(pureDarkTheme)
  const previewTheme =
    colorScheme === 'dark' ? previewDarkTheme : previewLightTheme

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', () => {
      if (
        previewLightTheme !== lightTheme ||
        previewDarkTheme !== darkTheme ||
        scale !== fontScale ||
        pureDark !== pureDarkTheme
      ) {
        update((prev) => ({
          ...prev,
          theme: previewLightTheme,
          lightTheme: previewLightTheme,
          darkTheme: previewDarkTheme,
          fontScale: scale,
          pureDarkTheme: pureDark,
        }))
      }
    })
    return unsubscribe
  }, [
    navigation,
    theme,
    previewLightTheme,
    previewDarkTheme,
    scale,
    pureDark,
    lightTheme,
    darkTheme,
    fontScale,
    pureDarkTheme,
    update,
  ])

  return (
    <ThemeProvider
      theme={previewTheme}
      fontScale={scale}
      colorScheme={colorScheme}
      pureDarkTheme={pureDark}
    >
      <AlertService>
        <View style={themeStyles.container}>
          <NavigationHeader canGoBack title='主题样式' />
          <ThemePreview
            lightTheme={previewLightTheme}
            darkTheme={previewDarkTheme}
            fontScale={scale}
            pureDarkTheme={pureDark}
            setLightTheme={setPreviewLightTheme}
            setDarkTheme={setPreviewDarkTheme}
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

const themeStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
})
