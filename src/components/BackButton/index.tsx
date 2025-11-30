import { GestureResponderEvent, ViewStyle } from 'react-native'
import { ChevronLeftIcon } from 'react-native-heroicons/outline'

import { useTheme } from '@/containers/ThemeService'

import Button from '../Button'

export default function BackButton({
  tintColor,
  onPress,
  style,
}: {
  tintColor?: string
  onPress: (event: GestureResponderEvent) => void
  style?: ViewStyle
}) {
  const { theme } = useTheme()
  return (
    <Button
      className='w-[44px] h-[44px] rounded-full'
      variant='icon'
      style={style}
      onPress={onPress}
      radius={22}
    >
      <ChevronLeftIcon
        size={28}
        color={tintColor || theme.colors.primary}
        style={{
          marginLeft: -6,
        }}
      />
    </Button>
  )
}
