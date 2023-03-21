import { Pressable, Text, View } from 'react-native'

import CheckIcon from '@/components/CheckIcon'
import { MyTheme, MyThemeDefinition } from '@/containers/ThemeService/types'
export default function ThemeOption(props: {
  theme: MyTheme
  data: MyThemeDefinition
  colorScheme: 'dark' | 'light'
  active: boolean
  onSelect(): void
}) {
  const { theme, data, colorScheme, active } = props
  const contrastTextColor = theme.dark ? theme.colors.black : theme.colors.white

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
        {active && <CheckIcon color={contrastTextColor} />}
      </View>
      <Text style={{ color: theme.colors.text }}>{data.title}</Text>
    </Pressable>
  )
}
