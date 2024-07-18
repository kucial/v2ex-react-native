import { ReactNode } from 'react'
import { Text, View } from 'react-native'

import { useTheme } from '@/containers/ThemeService'

export default function SectionHeader(props: {
  title: string
  desc?: string
  secondary?: ReactNode
}) {
  const { styles } = useTheme()
  return (
    <View className="pt-4 pb-1 pl-3 flex flex-row items-end">
      <Text className="font-medium" style={[styles.text, styles.text_base]}>
        {props.title}
      </Text>
      {!!props.desc && (
        <Text
          className="ml-2 mb-[2px]"
          style={[styles.text_desc, styles.text_xs]}>
          {props.desc}
        </Text>
      )}
      {props.secondary}
    </View>
  )
}
