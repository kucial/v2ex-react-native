import { View, Text, ImageBackground, Pressable } from 'react-native'
import React from 'react'
import albumAdd from './assets/album-add.png'
import { Alert } from 'react-native'
import { useImgurService } from '@/containers/ImgurService'

export default function AlbumCard(props) {
  const imgur = useImgurService()
  return (
    <Pressable
      className="active:opacity-50"
      onPress={() => {
        Alert.prompt('输入相册名称', undefined, async (val) => {
          const trimed = val.trim()
          if (!trimed) {
            return
          }
          await imgur.createAlbum({
            title: trimed
          })
        })
      }}>
      <View className="w-full pt-[100%] rounded-lg overflow-hidden ">
        <View className="absolute inset-0 w-full">
          <ImageBackground
            source={albumAdd}
            resizeMode="cover"
            style={{
              justifyContent: 'center',
              flex: 1
            }}></ImageBackground>
        </View>
      </View>
      <Text
        className="text-center text-sm mt-1"
        numberOfLines={1}
        ellipsizeMode="tail">
        新建相册
      </Text>
    </Pressable>
  )
}