import { useCallback } from 'react'
import { Text, View } from 'react-native'

import { useImgurService } from '@/containers/ImgurService'
import { ImgurAlbum, ImgurImage } from '@/containers/ImgurService/types'
import { useTheme } from '@/containers/ThemeService'

import BackButton from '../BackButton'
import { usePickerContext } from './context'
import ImagesGrid from './ImagesGrid'
import UploadButton from './UploadButton'

export default function AlbumImages(props: {
  album: ImgurAlbum
  onBackward: () => void
}) {
  const { album } = props
  const imgur = useImgurService()
  const imagesQuery = imgur.useAlbumImages(album.id)
  const { theme, styles } = useTheme()
  const context = usePickerContext()

  const handleDelete = useCallback(
    (image: ImgurImage) => {
      imgur.deleteImage({
        imageHash: image.deletehash,
        albumHash: album.deletehash,
      })
    },
    [album],
  )

  return (
    <View className="flex flex-1">
      <View
        className="flex flex-row items-center min-h-[44px] pt-1 px-1 pb-1"
        style={[styles.border_b_light]}>
        <View className="w-[56px]">
          <BackButton
            tintColor={theme.colors.text}
            onPress={props.onBackward}
          />
        </View>
        <View className="flex-1 px-1">
          <Text
            className="text-center font-medium"
            style={[styles.text, styles.text_base]}
            numberOfLines={1}
            ellipsizeMode="tail">
            {album.title}
          </Text>
        </View>
        <View className="w-[56px] items-end"></View>
      </View>
      <ImagesGrid
        imagesQuery={imagesQuery}
        selected={context.selected}
        onToggleSelect={context.toggleImage}
        onDelete={handleDelete}
      />
      <UploadButton
        onUploaded={imagesQuery.refetch}
        tintColor={theme.colors.text}
      />
    </View>
  )
}
