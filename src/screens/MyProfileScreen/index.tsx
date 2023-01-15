import { Text, View } from 'react-native'

import { useTheme } from '@/containers/ThemeService'

export default function ProfileScreen() {
  const { styles } = useTheme()
  return (
    <View className="py-8">
      <Text className="text-center" style={styles.text}>
        ProfileScreen
      </Text>
    </View>
  )
}
