import { Pressable, Text, View } from 'react-native'

import CheckIcon from '@/components/CheckIcon'
import { MyThemeDefinition, ThemeStyles } from '@/containers/ThemeService/types'
export default function ThemeOption(props: {
  styles: ThemeStyles
  data: MyThemeDefinition
  colorScheme: 'dark' | 'light'
  active: boolean
  onSelect(): void
}) {
  const { styles, data, colorScheme, active } = props

  return (
    <Pressable
      key={data.name}
      className="rounded-lg px-2 py-1 mb-3 items-center justify-center active:opacity-50 active:bg-gray-300/10"
      onPress={() => {
        props.onSelect()
      }}>
      <View
        style={{
          width: 34,
          height: 34,
          borderRadius: 999,
          backgroundColor: data[colorScheme].colors.primary,
          marginBottom: 6,
          alignItems: 'center',
          justifyContent: 'center',
          paddingRight: 1,
          paddingBottom: 1,
        }}>
        {active && <CheckIcon color={styles.btn_primary__text.color} />}
      </View>
      <Text style={[styles.text, styles.text_xs]}>{data.title}</Text>
    </Pressable>
  )
}
