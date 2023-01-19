import { useTheme } from '@/containers/ThemeService'
import { View, StyleSheet, ColorValue, ViewStyle } from 'react-native'

const TriangleCorner = (props: {
  color?: ColorValue
  style?: ViewStyle
  size?: number
  corner?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
}) => {
  const { theme } = useTheme()
  const { size = 16, color = theme.colors.primary, corner = 'top-left' } = props
  return (
    <View
      style={[
        styles.triangleCorner,
        {
          borderRightWidth: size,
          borderTopWidth: size,
          borderTopColor: color,
        },
        styles[corner],
        props.style,
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
