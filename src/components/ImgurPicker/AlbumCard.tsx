import { useCallback, useRef } from 'react'
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native'
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
      onPress={handleContextMenu}
    >
      <View style={albumCardStyles.wrapper}>
        <Pressable
          style={({ pressed }) => [
            albumCardStyles.imageBox,
            pressed && albumCardStyles.pressed,
          ]}
          onPress={props.onPress}
        >
          <View
            style={[
              albumCardStyles.absoluteInset,
              {
                backgroundColor: theme.colors.bg_layer3,
              },
            ]}
          >
            {coverUri ? (
              <Image
                source={{
                  uri: coverUri,
                }}
                contentFit='cover'
                style={albumCardStyles.absoluteInset}
              ></Image>
            ) : (
              <PhotoIcon size={30} color={theme.colors.text} />
            )}
          </View>
          <View style={albumCardStyles.badge}>
            <Text style={[styles.text_sm, { color: 'white' }]}>
              {data.images_count}
            </Text>
          </View>
        </Pressable>
        <View style={albumCardStyles.infoRow}>
          {data.privacy === 'hidden' && (
            <View style={albumCardStyles.lockIcon}>
              <LockClosedIcon size={14} color={theme.colors.text_meta} />
            </View>
          )}
          <View style={albumCardStyles.flex1}>
            <Text
              style={[styles.text, styles.text_sm]}
              numberOfLines={1}
              ellipsizeMode='tail'
            >
              {data.title}
            </Text>
          </View>
        </View>
      </View>
    </ContextMenu>
  )
}

const albumCardStyles = StyleSheet.create({
  wrapper: {
    padding: 4,
    margin: -4,
    borderRadius: 6,
  },
  imageBox: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  pressed: {
    opacity: 0.5,
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
  badge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignItems: 'center',
    minWidth: 30,
    backgroundColor: 'rgba(23, 23, 23, 0.2)',
    borderTopLeftRadius: 6,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  lockIcon: {
    paddingHorizontal: 4,
  },
  flex1: {
    flex: 1,
  },
})
