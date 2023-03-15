import { StyleSheet, View } from 'react-native'

import { useTheme } from '@/containers/ThemeService'

export default function HeaderLineFix() {
  const { styles } = useTheme()
  return <View style={[styles.border_b_light, innerStyle.item]}></View>
}

const innerStyle = StyleSheet.create({
  item: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
})
