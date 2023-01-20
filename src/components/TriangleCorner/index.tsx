import { useTheme } from '@/containers/ThemeService'
import { View, StyleSheet, ColorValue, ViewStyle } from 'react-native'

const TriangleCorner = (props: {
  color?: ColorValue
  style?: ViewStyle
  size?: number
  corner?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  opacity?: number
}) => {
  const { theme } = useTheme()
  const {
    size = 16,
    color = theme.colors.primary,
    corner = 'top-left',
    opacity = 0.65,
  } = props
  return (
    <View
      style={[
        styles.triangleCorner,
        styles[corner],
        props.style,
        {
          borderRightWidth: size,
          borderTopWidth: size,
          borderTopColor: color,
          opacity,
        },
      ]}
    />
  )
}

const styles = StyleSheet.create({
  triangleCorner: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderRightColor: 'transparent',
  },
  'top-left': {},
  'top-right': {
    transform: [{ rotate: '90deg' }],
  },
  'bottom-left': {
    transform: [{ rotate: '-90deg' }],
  },
  'bottom-right': {
    transform: [{ rotate: '180deg' }],
  },
})

export default TriangleCorner
