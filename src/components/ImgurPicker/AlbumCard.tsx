import { Pressable, Text, View } from 'react-native'
import { Image } from 'expo-image'
import { LockClosedIcon } from 'react-native-heroicons/outline'

import { getImageLink, useImgurService } from '@/containers/ImgurService'
import { ImgurAlbum } from '@/containers/ImgurService/types'
import { useTheme } from '@/containers/ThemeService'

import albumCover from './assets/album-cover.png'

export default function AlbumCard(props: {
  data: ImgurAlbum
  onPress(): void
}) {
  const { data } = props
  const { theme, styles } = useTheme()
  const imgur = useImgurService()
  const coverSwr = imgur.useImage(data.cover)

  return (
    <Pressable className="active:opacity-50" onPress={props.onPress}>
      <View className="w-full pt-[100%] rounded-lg overflow-hidden">
        <View
          className="absolute inset-0 w-full"
          style={{
            backgroundColor: theme.colors.text_placeholder,
          }}>
          <Image
            source={
              coverSwr.data
                ? {
                    uri: getImageLink(coverSwr.data, 's'),
                  }
                : albumCover
            }
            resizeMode="cover"
            style={{
              justifyContent: 'center',
              flex: 1,
            }}></Image>
        </View>
      </View>
      <Text
        className="text-sm mt-1"
        style={styles.text}
        numberOfLines={1}
        ellipsizeMode="tail">
        {data.title}
      </Text>
      <View className="flex flex-row items-center mt-[2px]">
        <View className="flex-1">
          <Text className="text-xs ml-[2px]" style={styles.text_meta}>
            {data.images_count}
          </Text>
        </View>
        {data.privacy === 'hidden' && (
          <View className="px-1">
            <LockClosedIcon size={12} color={theme.colors.text_meta} />
          </View>
        )}
      </View>
    </Pressable>
  )
}
