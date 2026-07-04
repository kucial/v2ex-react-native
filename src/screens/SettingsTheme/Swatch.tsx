import { StyleSheet, Text, View } from 'react-native'

import { useTheme } from '@/containers/ThemeService'
export default function Swatch({
  name,
  shadow = true,
}: {
  name: string
  shadow?: boolean
}) {
  const { theme, styles } = useTheme()
  return (
    <View style={swatchStyles.container}>
      <View
        style={[
          swatchStyles.colorBox,
          {
            backgroundColor: theme.colors[name],
          },
          shadow && styles.shadow,
        ]}
      ></View>
      <Text style={[swatchStyles.label, { color: theme.colors.text }]}>
        {name}
      </Text>
    </View>
  )
}

const swatchStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 16,
    width: 72,
  },
  colorBox: {
    borderRadius: 6,
    width: 72,
    height: 72,
    marginBottom: 6,
  },
  label: {
    textAlign: 'right',
    fontSize: 10,
  },
})
