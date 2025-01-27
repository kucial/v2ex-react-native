import { useCallback, useRef } from 'react'
import { Alert, Pressable, Text, View } from 'react-native'
import ContextMenu from 'react-native-context-menu-view'
import { LockClosedIcon, PhotoIcon } from 'react-native-heroicons/outline'
import { Image } from 'expo-image'

import { useAlertService } from '@/containers/AlertService'
import { getImageLink, useImgurService } from '@/containers/ImgurService'
import { ImgurAlbum } from '@/containers/ImgurService/types'
import { useTheme } from '@/containers/ThemeService'

export default function AlbumCard(props: {
  data: ImgurAlbum
  onPress(): void
}) {
  const { data } = props
  const { theme, styles } = useTheme()
  const imgur = useImgurService()
  const coverQuery = imgur.useImage(data.cover)
  const alert = useAlertService()

  const coverUri = coverQuery.data && getImageLink(coverQuery.data, 's')

  const renameAlbum = useCallback(() => {
    Alert.prompt('输入新的相册名称', undefined, async (val) => {
      const trimed = val.trim()
      if (!trimed) {
        alert.show({ type: 'error', message: '相册名称无效' })
        return
      }
      let loading
      try {
        loading = alert.show({
          type: 'default',
          loading: true,
          message: '正在重命名相册',
          duration: 0,
        })
        await imgur.renameAlbum(data.deletehash, trimed)
      } catch (err) {
        const message = err.response?.data?.error || err.message
        alert.show({ type: 'error', message })
      } finally {
        alert.hide(loading)
      }
    })
  }, [data])

  const deleteAlbum = useCallback(async () => {
    let loading
    try {
      loading = alert.show({
        type: 'default',
        loading: true,
        message: '正在删除相册',
        duration: 0,
      })
      await imgur.deleteAlbum(data.deletehash)
    } catch (err) {
      const message = err.response?.data?.error || err.message
      alert.show({ type: 'error', message })
    } finally {
      alert.hide(loading)
    }
  }, [data])

  const handleContextMenu = useCallback(
    (e) => {
      const index = e.nativeEvent.index
      switch (index) {
        case 0:
          return renameAlbum()
        case 1:
          return deleteAlbum()
      }
    },
    [data],
  )

  return (
    <ContextMenu
      actions={[
        { title: '重命名', systemIcon: 'pencil' },
        { title: '删除', systemIcon: 'trash', destructive: true },
      ]}
      onPress={handleContextMenu}>
      <View className="p-1 -m-1 rounded-md">
        <Pressable
          className="w-full aspect-square rounded-lg overflow-hidden active:opacity-50"
          onPress={props.onPress}>
          <View
            className="absolute inset-0 w-full items-center justify-center"
            style={{
              backgroundColor: theme.colors.bg_layer3,
            }}>
            {coverUri ? (
              <Image
                source={{
                  uri: coverUri,
                }}
                contentFit="cover"
                className="absolute inset-0"></Image>
            ) : (
              <PhotoIcon size={30} color={theme.colors.text} />
            )}
          </View>
          <View className="absolute right-0 bottom-0 px-2 py-[2] items-center min-w-[30] bg-neutral-900/20 rounded-tl-md">
            <Text style={[styles.text_sm, { color: 'white' }]}>
              {data.images_count}
            </Text>
          </View>
        </Pressable>
        <View className="flex-row items-center mt-1">
          {data.privacy === 'hidden' && (
            <View className="px-1">
              <LockClosedIcon size={14} color={theme.colors.text_meta} />
            </View>
          )}
          <View className="flex-1">
            <Text
              style={[styles.text, styles.text_sm]}
              numberOfLines={1}
              ellipsizeMode="tail">
              {data.title}
            </Text>
          </View>
        </View>
      </View>
    </ContextMenu>
  )
}
