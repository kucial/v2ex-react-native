import { useCallback } from 'react'
import { StyleSheet, Text, View } from 'react-native'

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
    <View style={albumImagesStyles.container}>
      <View style={[albumImagesStyles.headerRow, styles.border_b_light]}>
        <View style={albumImagesStyles.sideBox}>
          <BackButton
            tintColor={theme.colors.text}
            onPress={props.onBackward}
          />
        </View>
        <View style={albumImagesStyles.titleWrap}>
          <Text
            style={[
              albumImagesStyles.titleText,
              styles.text,
              styles.text_base,
            ]}
            numberOfLines={1}
            ellipsizeMode='tail'
          >
            {album.title}
          </Text>
        </View>
        <View style={albumImagesStyles.sideBoxRight}></View>
      </View>
      <ImagesGrid
        imagesQuery={imagesQuery}
        selected={context.selected}
        onToggleSelect={context.toggleImage}
        onDelete={handleDelete}
      />
      <UploadButton
        onUploaded={imagesQuery.refetch}
        tintColor={styles.btn_success__text.color}
      />
    </View>
  )
}

const albumImagesStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
    paddingTop: 4,
    paddingHorizontal: 4,
    paddingBottom: 4,
  },
  sideBox: {
    width: 56,
  },
  titleWrap: {
    flex: 1,
    paddingHorizontal: 4,
  },
  titleText: {
    textAlign: 'center',
    fontWeight: '500',
  },
  sideBoxRight: {
    width: 56,
    alignItems: 'flex-end',
  },
})
