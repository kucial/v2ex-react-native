import { View, Text, ImageBackground, Pressable } from 'react-native'
import React from 'react'
import classNames from 'classnames'

import { CheckIcon } from 'react-native-heroicons/solid'
import { getImageLink } from '@/containers/ImgurService'
import imagePlaceholder from './assets/image-placeholder.png'

export default function ImageCard(props) {
  const { data, selected } = props
  return (
    <Pressable className="active:opacity-50 relative" onPress={props.onPress}>
      <View className="w-full pt-[100%] overflow-hidden">
        <View className="absolute inset-0 w-full bg-neutral-100">
          <ImageBackground
            source={
              data?.link
                ? {
                    uri: getImageLink(data, 'l')
                  }
                : imagePlaceholder
            }
            resizeMode="cover"
            style={{
              justifyContent: 'center',
              flex: 1
            }}></ImageBackground>
        </View>
      </View>
      <Pressable
        className={classNames(
          'absolute right-0 top-0 p-2 items-center justify-center active:opacity-60'
        )}
        onPress={(e) => {
          e.stopPropagation()
          props.onToggleSelect()
        }}>
        <View
          className={classNames(
            'w-[18px] h-[18px] rounded-full items-center justify-center',
            selected ? 'bg-neutral-800' : 'border'
          )}>
          {selected && <CheckIcon size={12} color="white" />}
        </View>
      </Pressable>
      {/* <View className="flex flex-row items-center mt-[2px]">
        <View className="flex-1">

        </View>
        {data.privacy === 'hidden' && (
          <View className="px-1">
            <LockClosedIcon size={12} color="#888888" />
          </View>
        )}
      </View> */}
    </Pressable>
  )
}
