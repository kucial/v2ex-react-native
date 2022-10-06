import React from 'react'
import { ImageBackground, Pressable, Text, View } from 'react-native'
import { LockClosedIcon } from 'react-native-heroicons/outline'
import colors from 'tailwindcss/colors'
import { useColorScheme } from 'tailwindcss-react-native'

import { getImageLink, useImgurService } from '@/containers/ImgurService'

import albumCover from './assets/album-cover.png'

export default function AlbumCard(props) {
  const { data } = props
  const imgur = useImgurService()
  const coverSwr = imgur.useImage(data.cover)
  const { colorScheme } = useColorScheme()
  return (
    <Pressable className="active:opacity-50" onPress={props.onPress}>
      <View className="w-full pt-[100%] rounded-lg overflow-hidden">
        <View className="absolute inset-0 w-full dark:bg-neutral-600">
          <ImageBackground
            source={
              coverSwr.data
                ? {
                    uri: getImageLink(coverSwr.data, 's')
                  }
                : albumCover
            }
            resizeMode="cover"
            style={{
              justifyContent: 'center',
              flex: 1
            }}></ImageBackground>
        </View>
      </View>
      <Text
        className="text-sm mt-1 dark:text-neutral-300"
        numberOfLines={1}
        ellipsizeMode="tail">
        {data.title}
      </Text>
      <View className="flex flex-row items-center mt-[2px]">
        <View className="flex-1">
          <Text className="text-xs text-neutral-500 dark:text-neutral-400 ml-[2px]">
            {data.images_count}
          </Text>
        </View>
        {data.privacy === 'hidden' && (
          <View className="px-1">
            <LockClosedIcon
              size={12}
              color={
                colorScheme === 'dark'
                  ? colors.neutral[400]
                  : colors.neutral[500]
              }
            />
          </View>
        )}
      </View>
    </Pressable>
  )
}
