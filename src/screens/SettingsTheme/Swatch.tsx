import { Text, View } from 'react-native'

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
    <View
      className="items-center mr-4 mb-4"
      style={{
        width: 72,
      }}>
      <View
        style={[
          {
            borderRadius: 6,
            width: 72,
            height: 72,
            backgroundColor: theme.colors[name],
            marginBottom: 6,
          },
          shadow && styles.shadow,
        ]}></View>
      <Text
        style={{ textAlign: 'right', fontSize: 10, color: theme.colors.text }}>
        {name}
      </Text>
    </View>
  )
}
