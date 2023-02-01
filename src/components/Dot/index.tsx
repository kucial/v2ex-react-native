import { ColorValue, View, ViewStyle } from 'react-native'

import { useTheme } from '@/containers/ThemeService'

export default function Dot(props: {
  size?: number
  opacity?: number
  color?: ColorValue
  style?: ViewStyle
}) {
  const { theme } = useTheme()
  const { size = 4, opacity = 0.8, color = theme.colors.primary } = props
  return (
    <View
      style={[
        {
          width: size,
          height: size,
          backgroundColor: color,
          opacity,
          borderRadius: 999,
        },
        props.style,
      ]}></View>
  )
}
