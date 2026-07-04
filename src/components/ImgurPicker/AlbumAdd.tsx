import { Alert, Pressable, StyleSheet, Text, View } from 'react-native'
import { PlusIcon } from 'react-native-heroicons/outline'

import { useImgurService } from '@/containers/ImgurService'
import { useTheme } from '@/containers/ThemeService'

export default function AlbumCard(props) {
  const imgur = useImgurService()
  const { theme, styles } = useTheme()
  return (
    <Pressable
      style={({ pressed }) => pressed && albumAddStyles.pressed}
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
      <View style={albumAddStyles.imageBox}>
        <View
          style={[
            albumAddStyles.absoluteInset,
            {
              backgroundColor: theme.colors.bg_layer3,
            },
          ]}
        >
          <PlusIcon size={30} color={theme.colors.text} />
        </View>
      </View>
      <View style={albumAddStyles.textWrap}>
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

const albumAddStyles = StyleSheet.create({
  pressed: {
    opacity: 0.5,
  },
  imageBox: {
    width: '100%',
    paddingTop: '100%',
    borderRadius: 8,
    overflow: 'hidden',
  },
  absoluteInset: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: {
    marginTop: 4,
    paddingHorizontal: 4,
  },
})
