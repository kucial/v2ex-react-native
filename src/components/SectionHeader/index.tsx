import { Text, View } from 'react-native'

import { useTheme } from '@/containers/ThemeService'

export default function SectionHeader(props: { title: string; desc?: string }) {
  const { styles } = useTheme()
  return (
    <View className="pt-4 pb-1 pl-3 flex flex-row items-end">
      <Text className="text-base font-medium" style={styles.text}>
        {props.title}
      </Text>
      {!!props.desc && (
        <Text className="text-xs ml-2 mb-[2px]" style={styles.text_desc}>
          {props.desc}
        </Text>
      )}
    </View>
  )
}
