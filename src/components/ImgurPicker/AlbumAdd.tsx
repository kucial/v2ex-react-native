import { Pressable, Text, View } from 'react-native'
import { Alert } from 'react-native'
import { Image } from 'expo-image'

import { useImgurService } from '@/containers/ImgurService'
import { useTheme } from '@/containers/ThemeService'

import albumAdd from './assets/album-add.png'

export default function AlbumCard(props) {
  const imgur = useImgurService()
  const { theme, styles } = useTheme()
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
            title: trimed,
          })
        })
      }}>
      <View className="w-full pt-[100%] rounded-lg overflow-hidden ">
        <View
          className="absolute inset-0 w-full"
          style={{
            backgroundColor: theme.colors.text_placeholder,
          }}>
          <Image
            source={albumAdd}
            resizeMode="cover"
            style={{
              justifyContent: 'center',
              flex: 1,
            }}></Image>
        </View>
      </View>
      <Text
        className="text-center text-sm mt-1"
        style={styles.text}
        numberOfLines={1}
        ellipsizeMode="tail">
        新建相册
      </Text>
    </Pressable>
  )
}
