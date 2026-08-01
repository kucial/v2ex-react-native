import { StyleSheet, Text, View } from 'react-native'

import { useTheme } from '@/containers/ThemeService'

export default function EmptyHint({ text }: { text: string }) {
  const { styles } = useTheme()
  return (
    <View style={emptyStyles.wrap}>
      <Text style={[styles.text_meta, styles.text_sm]}>{text}</Text>
    </View>
  )
}

const emptyStyles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
})
