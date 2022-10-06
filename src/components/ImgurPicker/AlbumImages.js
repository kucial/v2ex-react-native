import { View, Text, SafeAreaView, InteractionManager } from 'react-native'
import { useEffect } from 'react'

import { useImgurService } from '@/containers/ImgurService'

import BackButton from '../BackButton'
import UploadButton from './UploadButton'
import { useColorScheme } from 'tailwindcss-react-native'
import colors from 'tailwindcss/colors'

import ImagesGrid from './ImagesGrid'

export default function AlbumView(props) {
  const { album } = props
  const { colorScheme } = useColorScheme()
  const imgur = useImgurService()
  const imagesSwr = imgur.useAlbumImages(album.id)

  useEffect(() => {
    InteractionManager.runAfterInteractions(() => {
      if (
        !imagesSwr.isValidating &&
        (!imagesSwr.data ||
          !imagesSwr.data.fetchedAt ||
          Date.now() - imagesSwr.data.fetchedAt > 1000 * 60 * 5) // 自动刷新
      ) {
        imagesSwr.mutate()
      }
    })
  }, [])

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
              onUploaded={imagesSwr.mutate}
              tintColor={
                colorScheme === 'dark'
                  ? colors.neutral[300]
                  : colors.neutral[900]
              }
            />
          </View>
        </View>
      </SafeAreaView>
      <ImagesGrid
        imagesSwr={imagesSwr}
        selected={props.selected}
        onToggleSelect={props.onToggleSelect}
      />
    </View>
  )
}
