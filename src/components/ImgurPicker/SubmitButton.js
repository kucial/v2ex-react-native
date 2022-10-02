import { View } from 'react-native'
import React from 'react'
import { CheckIcon } from 'react-native-heroicons/outline'
import { Pressable } from 'react-native'
import classNames from 'classnames'
import { useColorScheme } from 'tailwindcss-react-native'
import colors from 'tailwindcss/colors'

export default function UploadButton(props) {
  const { colorScheme } = useColorScheme()
  return (
    <View className="absolute bottom-[56px] right-[24px]">
      <Pressable
        className={classNames(
          'w-[62px] h-[62px] items-center justify-center rounded-full shadow-sm active:opacity-60',
          'bg-neutral-900',
          'dark:bg-amber-50'
        )}
        style={props.disabled && { opacity: 0.5 }}
        onPress={props.onPress}
        disabled={props.disabled}>
        <CheckIcon
          color={colorScheme === 'dark' ? colors.neutral[900] : 'white'}
          size={18}
        />
      </Pressable>
    </View>
  )
}
