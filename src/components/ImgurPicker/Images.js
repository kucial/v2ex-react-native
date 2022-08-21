import { View, Text, ScrollView, RefreshControl } from 'react-native'
import React from 'react'
import { useImgurService } from '@/containers/ImgurService'
import { isRefreshing } from '@/utils/swr'

import ImageCard from './ImageCard'

export default function Images(props) {
  const imgur = useImgurService()
  const imagesSwr = imgur.useImages()
  return (
    <ScrollView
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing(imagesSwr)}
          onRefresh={() => {
            imagesSwr.mutate()
          }}
        />
      }>
      <View className="py-2 px-[1px]">
        <View className="flex flex-row flex-wrap">
          {imagesSwr.data?.map((image) => (
            <View className="basis-1/3 p-[1px]" key={image.id}>
              <ImageCard
                data={image}
                selected={!!props.selected.find((i) => i.id === image.id)}
                onPress={() => {
                  props.onToggleSelect(image)
                }}
              />
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  )
}
