import { View } from 'react-native'
import { Pressable } from 'react-native'
import classNames from 'classnames'
import colors from 'tailwindcss/colors'
import { useColorScheme } from 'tailwindcss-react-native'

import CheckIcon from '@/components/CheckIcon'

export default function SubmitButton(props) {
  const { colorScheme } = useColorScheme()
  return (
    <View className="absolute bottom-[56px] right-[24px]">
      <Pressable
        className={classNames(
          'w-[62px] h-[62px] items-center justify-center rounded-full shadow-sm active:opacity-60',
          'bg-neutral-900',
          'dark:bg-amber-50',
        )}
        style={props.disabled && { opacity: 0.5 }}
        onPress={props.onPress}
        disabled={props.disabled}>
        <CheckIcon
          color={colorScheme === 'dark' ? colors.neutral[900] : 'white'}
          size={22}
        />
      </Pressable>
    </View>
  )
}
