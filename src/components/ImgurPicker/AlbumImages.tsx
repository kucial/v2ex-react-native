import { SafeAreaView, StyleSheet, Text, View } from 'react-native'

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

  return (
    <View className="flex flex-1">
      <SafeAreaView>
        <View
          className="flex flex-row items-center min-h-[44px] pt-1 px-1 pb-1"
          style={[styles.border_b_light]}>
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
