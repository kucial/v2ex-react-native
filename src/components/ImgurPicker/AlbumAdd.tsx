import { Alert, Pressable, Text, View } from 'react-native'
import { PlusIcon } from 'react-native-heroicons/outline'

import { useImgurService } from '@/containers/ImgurService'
import { useTheme } from '@/containers/ThemeService'

export default function AlbumCard(props) {
  const imgur = useImgurService()
  const { theme, styles } = useTheme()
  return (
    <Pressable
      className='active:opacity-50'
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
      }}
    >
      <View className='w-full pt-[100%] rounded-lg overflow-hidden '>
        <View
          className='absolute inset-0 w-full items-center justify-center'
          style={{
            backgroundColor: theme.colors.bg_layer3,
          }}
        >
          <PlusIcon size={30} color={theme.colors.text} />
        </View>
      </View>
      <View className='mt-1 px-1'>
        <Text
          style={[styles.text, styles.text_sm]}
          numberOfLines={1}
          ellipsizeMode='tail'
        >
          新建相册
        </Text>
      </View>
    </Pressable>
  )
}
