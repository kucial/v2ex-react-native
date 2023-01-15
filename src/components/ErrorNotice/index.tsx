import { Text, View, ViewStyle } from 'react-native'
import { ReactElement } from 'react'

import { useTheme } from '@/containers/ThemeService'

export default function ErrorNotice(props: {
  error: Error
  extra?: ReactElement
  style?: ViewStyle
}) {
  const { styles } = useTheme()

  return (
    <View className="min-h-[60px] py-5" style={[props.style, styles.layer2]}>
      <View className="flex flex-row items-center justify-center">
        <Text className="my-md text-center" style={styles.text}>
          {props.error.message}
        </Text>
      </View>
      {props.extra}
    </View>
  )
}
