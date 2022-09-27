import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  RefreshControl,
  Pressable
} from 'react-native'
import React, { useCallback } from 'react'

import { useImgurService } from '@/containers/ImgurService'
import { isRefreshing } from '@/utils/swr'

import ImageCard from './ImageCard'
import BackButton from '../BackButton'
import UploadButton from './UploadButton'
import { useColorScheme } from 'tailwindcss-react-native'
import colors from 'tailwindcss/colors'

export default function AlbumView(props) {
  const { album } = props
  const { colorScheme } = useColorScheme()
  const imgur = useImgurService()
  const imagesSwr = imgur.useAlbumImages(album.id)
  return (
    <View className="flex flex-1">
      <SafeAreaView>
        <View className="flex flex-row items-center min-h-[44px] pt-1 px-1 pb-1 border-b border-neutral-300 dark:border-neutral-600">
          <View className="w-[56px]">
            <BackButton
              tintColor={
                colorScheme === 'dark'
                  ? colors.neutral[300]
                  : colors.neutral[900]
              }
              onPress={props.onCancel}
            />
          </View>
          <View className="flex-1 px-1">
            <Text
              className="text-center font-medium text-base dark:text-neutral-300"
              numberOfLines={1}
              ellipsizeMode="tail">
              {album.title}
            </Text>
          </View>
          <View className="w-[56px] items-end">
            <UploadButton
              tintColor={
                colorScheme === 'dark'
                  ? colors.neutral[300]
                  : colors.neutral[900]
              }
            />
          </View>
        </View>
      </SafeAreaView>
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl
            tintColor={
              colorScheme === 'dark' ? colors.neutral[300] : colors.neutral[900]
            }
            refreshing={isRefreshing(imagesSwr)}
            onRefresh={() => {
              imagesSwr.mutate()
            }}
          />
        }>
        <View className="px-2 py-2">
          {imagesSwr.error && (
            <View>
              <Text>{imagesSwr.error.message}</Text>
            </View>
          )}
          <View className="flex flex-row flex-wrap">
            {imagesSwr.data?.map((image) => (
              <View className="basis-1/2 p-2" key={image.id}>
                <ImageCard
                  data={image}
                  selected={!!props.selected.find((i) => i.id === image.id)}
                  onPress={() => {
                    props.onToggleImage(image)
                  }}
                />
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  )
}
