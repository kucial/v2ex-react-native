import { View, Text, ScrollView, RefreshControl } from 'react-native'
import React from 'react'
import { useColorScheme } from 'tailwindcss-react-native'
import colors from 'tailwindcss/colors'

import { useImgurService } from '@/containers/ImgurService'

import AlbumCard from './AlbumCard'
import AlbumAdd from './AlbumAdd'
import { isRefreshing } from '@/utils/swr'

export default function Albums(props) {
  const imgur = useImgurService()
  const albumsSwr = imgur.useAlbums()
  const { colorScheme } = useColorScheme()
  return (
    <ScrollView
      refreshControl={
        <RefreshControl
          tintColor={
            colorScheme === 'dark' ? colors.neutral[300] : colors.neutral[900]
          }
          refreshing={isRefreshing(albumsSwr)}
          onRefresh={() => {
            albumsSwr.mutate()
          }}
        />
      }>
      <View className="py-2 px-[2px]">
        <View className="flex flex-row flex-wrap">
          {albumsSwr.data?.map((album) => (
            <View className="basis-1/3 p-[2px] mb-2" key={album.id}>
              <AlbumCard
                data={album}
                onPress={() => {
                  props.onSelectAlbum(album)
                }}
              />
            </View>
          ))}

          <View className="basis-1/3 p-[2px]">
            <AlbumAdd />
          </View>
        </View>
      </View>
    </ScrollView>
  )
}
