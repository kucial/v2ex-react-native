import { useCallback } from 'react'
import { Alert } from 'react-native'
import { Pressable } from 'react-native'
import { ArrowUpTrayIcon } from 'react-native-heroicons/outline'
import * as Sentry from '@sentry/react-native'
import * as ImagePicker from 'expo-image-picker'

import { useAlertService } from '@/containers/AlertService'
import { useImgurService } from '@/containers/ImgurService'

import { useAlbum } from './context'

export default function UploadButton(props) {
  const imgur = useImgurService()
  const album = useAlbum()
  const alert = useAlertService()
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
    <Pressable
      className="h-[44px] w-[44px] items-center justify-center rounded-full active:bg-neutral-100 dark:active:bg-neutral-600"
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
          // mutate album cache
          alert.show({ type: 'success', message: '上传成功' })
        } catch (err) {
          alert.show({ type: 'error', message: err.message })
          Sentry.captureException(err)
        } finally {
          alert.hide(indicator)
        }
      }}>
      <ArrowUpTrayIcon size={22} color={props.tintColor} />
    </Pressable>
  )
}
