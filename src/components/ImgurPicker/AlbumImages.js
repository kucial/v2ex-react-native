import { useEffect } from 'react'
import { InteractionManager, SafeAreaView, Text, View } from 'react-native'
import { hairlineWidth } from 'nativewind'
import colors from 'tailwindcss/colors'

import { useImgurService } from '@/containers/ImgurService'
import { useTheme } from '@/containers/ThemeService'

import BackButton from '../BackButton'
import ImagesGrid from './ImagesGrid'
import UploadButton from './UploadButton'

export default function AlbumView(props) {
  const { album } = props
  const imgur = useImgurService()
  const imagesSwr = imgur.useAlbumImages(album.id)
  const { theme, styles } = useTheme()

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
        <View
          className="flex flex-row items-center min-h-[44px] pt-1 px-1 pb-1 border-b"
          style={{
            borderColor: theme.colors.border,
            borderWidth: hairlineWidth(),
          }}>
          <View className="w-[56px]">
            <BackButton
              tintColor={theme.colors.text}
              onPress={props.onCancel}
            />
          </View>
          <View className="flex-1 px-1">
            <Text
              className="text-center font-medium text-base"
              style={styles.text}
              numberOfLines={1}
              ellipsizeMode="tail">
              {album.title}
            </Text>
          </View>
          <View className="w-[56px] items-end">
            <UploadButton
              onUploaded={imagesSwr.mutate}
              tintColor={theme.colors.text}
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
