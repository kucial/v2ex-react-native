import { useCallback } from 'react'
import { Alert, Pressable, StyleSheet, View } from 'react-native'
import * as Sentry from '@sentry/react-native'
import * as ImagePicker from 'expo-image-picker'

import V2exIcon from '@/components/icons/V2exIcon'

import { useAlertService } from '@/containers/AlertService'
import { useImgurService } from '@/containers/ImgurService'
import { useTheme } from '@/containers/ThemeService'

import { useAlbum } from './context'

export default function UploadButton(props) {
  const imgur = useImgurService()
  const album = useAlbum()
  const alert = useAlertService()
  const { theme } = useTheme()
  const uploadImage = useCallback(
    async (imageInfo) => {
      if (!imgur) {
        return
      }
      const localUri = imageInfo.uri
      const filename = localUri.split('/').pop()
      const match = /\.(\w+)$/.exec(filename)
      const type = match ? `image/${match[1]}` : `image`
      const imgurRes = await imgur.uploadImage({
        image: {
          uri: imageInfo.uri,
          name: imageInfo.fileName || filename,
          type,
        },
        type: 'file',
        name: imageInfo.fileName,
        album: album?.deletehash,
      })
      return imgurRes
    },
    [imgur, album],
  )
  if (!imgur) {
    return null
  }
  return (
    <View style={uploadStyles.container}>
      <Pressable
        style={({ pressed }) => [
          uploadStyles.button,
          { backgroundColor: theme.dark ? '#93c5fd' : '#1d4ed8' },
          pressed && uploadStyles.pressed,
        ]}
        onPress={async () => {
          const permissionRes =
            await ImagePicker.requestMediaLibraryPermissionsAsync()
          if (permissionRes.accessPrivileges === 'none') {
            Alert.alert('无相册访问权限')
            return
          }
          const result = await ImagePicker.launchImageLibraryAsync({
            allowsMultipleSelection: true,
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            // allowsEditing: true
            // base64: true
          })
          if (result.canceled) {
            return
          }
          const indicator = alert.show({
            type: 'default',
            message: '上传中',
            loading: true,
            duration: 0,
          })
          try {
            await new Promise((resolve) => {
              setTimeout(resolve, 3000)
            })
            let uploaded
            if (result.assets) {
              uploaded = await Promise.all(
                result.assets.map((item) => {
                  return uploadImage(item)
                }),
              )
            } else {
              const imageEntity = await uploadImage(result)
              uploaded = [imageEntity]
            }
            // 刷新缓存
            if (album?.id) {
              imgur.refreshAlbumImages(album.id)
            } else {
              imgur.refreshImages()
            }
            alert.show({ type: 'success', message: '上传成功' })
          } catch (err) {
            alert.show({ type: 'error', message: err.message })
            Sentry.captureException(err)
          } finally {
            alert.hide(indicator)
          }
        }}
      >
        <V2exIcon
          name='arrow-up-tray-outline'
          size={22}
          color={props.tintColor}
        />
      </Pressable>
    </View>
  )
}

const uploadStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 56,
    right: 16,
  },
  button: {
    opacity: 0.7,
    height: 56,
    width: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 28,
  },
  pressed: {
    opacity: 0.5,
  },
})
