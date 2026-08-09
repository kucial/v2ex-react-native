import {
  ColorValue,
  GestureResponderEvent,
  StyleSheet,
  ViewStyle,
} from 'react-native'

import V2exIcon from '@/components/icons/V2exIcon'

import { useTheme } from '@/containers/ThemeService'

import Button from '../Button'

export default function BackButton({
  tintColor,
  onPress,
  style,
}: {
  tintColor?: ColorValue
  onPress: (event: GestureResponderEvent) => void
  style?: ViewStyle
}) {
  const { theme } = useTheme()
  return (
    <Button
      style={[backBtnStyles.btn, style]}
      variant='icon'
      onPress={onPress}
      radius={22}
      accessibilityLabel='返回'
    >
      <V2exIcon
        name='chevron-left-outline'
        size={28}
        color={tintColor || theme.colors.primary}
        style={{
          marginLeft: -6,
        }}
      />
    </Button>
  )
}

const backBtnStyles = StyleSheet.create({
  btn: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
})
