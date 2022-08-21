import { View, Text, ImageBackground, Pressable } from 'react-native'
import React from 'react'
import { LockClosedIcon } from 'react-native-heroicons/outline'
import { getImageLink, useImgurService } from '@/containers/ImgurService'
import albumCover from './assets/album-cover.png'

export default function AlbumCard(props) {
  const { data } = props
  const imgur = useImgurService()
  const coverSwr = imgur.useImage(data.cover)
  return (
    <Pressable className="active:opacity-50" onPress={props.onPress}>
      <View className="w-full pt-[100%] rounded-lg overflow-hidden">
        <View className="absolute inset-0 w-full">
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
      <Text className="text-sm mt-1" numberOfLines={1} ellipsizeMode="tail">
        {data.title}
      </Text>
      <View className="flex flex-row items-center mt-[2px]">
        <View className="flex-1">
          <Text className="text-xs text-gray-400 ml-[2px]">
            {data.images_count}
          </Text>
        </View>
        {data.privacy === 'hidden' && (
          <View className="px-1">
            <LockClosedIcon size={12} color="#888888" />
          </View>
        )}
      </View>
    </Pressable>
  )
}
