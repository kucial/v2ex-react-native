import { StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'
import Color from 'color'
import { BlurView } from 'expo-blur'

import { useTheme } from '@/containers/ThemeService'

export default function BlurTabBarBackground() {
  const { theme } = useTheme()
  return (
    <BlurView
      // System chrome material automatically adapts to the system's theme
      // and matches the native tab bar appearance on iOS.
      tint="systemChromeMaterial"
      intensity={100}
      style={StyleSheet.absoluteFill}>
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: Color(theme.colors.primary)
              .darken(0.5)
              .alpha(0.02)
              .toString(),
          },
        ]}></View>
    </BlurView>
  )
}

export function useBottomTabOverflow() {
  const tabHeight = useBottomTabBarHeight()
  const { bottom } = useSafeAreaInsets()
  return tabHeight - bottom
}
