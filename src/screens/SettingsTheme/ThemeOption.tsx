import { Pressable, StyleSheet, Text, View } from 'react-native'

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
      style={({ pressed }) => [
        optionStyles.container,
        pressed && optionStyles.pressed,
      ]}
      onPress={() => {
        props.onSelect()
      }}
    >
      <View
        style={[
          optionStyles.colorCircle,
          {
            backgroundColor:
              data[colorScheme || 'light']?.colors?.primary || '#333333',
          },
        ]}
      >
        {active && <CheckIcon color={styles.btn_primary__text.color} />}
      </View>
      <Text style={[styles.text, styles.text_xs]}>{data.title}</Text>
    </Pressable>
  )
}

const optionStyles = StyleSheet.create({
  container: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.5,
    backgroundColor: 'rgba(209, 213, 219, 0.1)',
  },
  colorCircle: {
    width: 34,
    height: 34,
    borderRadius: 999,
    marginBottom: 6,
    alignItems: 'center',
    justifyContent: 'center',
    paddingRight: 1,
    paddingBottom: 1,
  },
})
