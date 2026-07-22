import { PropsWithChildren } from 'react'
import { Platform, StyleSheet, View, ViewProps } from 'react-native'
import { GlassView, isGlassEffectAPIAvailable } from 'expo-glass-effect'

import { useAIChatTheme } from './theme'

type Props = PropsWithChildren<
  ViewProps & { interactive?: boolean; tintColor?: string }
>

function glassAvailable(): boolean {
  if (Platform.OS !== 'ios') return false
  try {
    return isGlassEffectAPIAvailable()
  } catch {
    return false
  }
}

export default function GlassSurface({
  children,
  style,
  interactive = false,
  tintColor,
  ...props
}: Props) {
  const { colorScheme, colors } = useAIChatTheme()
  if (glassAvailable()) {
    return (
      <GlassView
        {...props}
        style={style}
        colorScheme={colorScheme}
        glassEffectStyle='regular'
        isInteractive={interactive}
        tintColor={tintColor}
      >
        {children}
      </GlassView>
    )
  }

  return (
    <View
      {...props}
      style={[
        {
          backgroundColor: tintColor ?? colors.glassFallback,
          borderColor: colors.border,
          borderWidth: StyleSheet.hairlineWidth,
        },
        style,
      ]}
    >
      {children}
    </View>
  )
}
