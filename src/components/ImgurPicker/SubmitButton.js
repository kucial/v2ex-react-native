import { View } from 'react-native'
import React from 'react'
import { CheckIcon } from 'react-native-heroicons/outline'
import { Pressable } from 'react-native'

export default function UploadButton(props) {
  console.log('disabled', props.disabled)
  return (
    <View className="absolute bottom-[56px] right-[24px]">
      <Pressable
        className="w-[56px] h-[56px] bg-gray-900 items-center justify-center rounded-full shadow-sm active:opacity-60"
        style={props.disabled && { opacity: 0.5 }}
        onPress={props.onPress}
        disabled={props.disabled}>
        <CheckIcon color="white" size={18} />
      </Pressable>
    </View>
  )
}
