import { useCallback } from 'react'
import { Alert } from 'react-native'
import { Pressable } from 'react-native'
import { ArrowUpTrayIcon } from 'react-native-heroicons/outline'
import * as ImagePicker from 'expo-image-picker'
import * as Sentry from 'sentry-expo'
import { useSWRConfig } from 'swr'

import { useActivityIndicator } from '@/containers/ActivityIndicator'
import { useAlertService } from '@/containers/AlertService'
import { useImgurService } from '@/containers/ImgurService'

import { useAlbum } from './context'

export default function UploadButton(props) {
  const imgur = useImgurService()
  const album = useAlbum()
  const { mutate } = useSWRConfig()
  const alert = useAlertService()
  const aIndicator = useActivityIndicator()
  const uploadImage = useCallback(
    async (imageInfo) => {
      if (!imgur) {
        return
      }
      const localUri = imageInfo.uri
      const filename = localUri.split('/').pop()
      const match = /\.(\w+)$/.exec(filename)
      let type = match ? `image/${match[1]}` : `image`

      const imgurRes = await imgur.upload({
        image: {
          uri: imageInfo.uri,
          name: imageInfo.fileName || filename,
          type
        },
        type: 'file',
        name: imageInfo.fileName,
        album: album?.deletehash
      })
      return imgurRes.data
    },
    [imgur, album]
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
        if (permissionRes === 'none') {
          Alert.alert('无相册访问权限')
          return
        }
        const result = await ImagePicker.launchImageLibraryAsync({
          allowsMultipleSelection: true,
          mediaTypes: ImagePicker.MediaTypeOptions.Images
          // allowsEditing: true
          // base64: true
        })
        if (result.cancelled || result.err) {
          return
        }
        try {
          aIndicator.show()
          let uploaded
          if (result.selected) {
            uploaded = await Promise.all(
              result.selected.map((item) => {
                return uploadImage(item, album)
              })
            )
          } else {
            const imageEntity = await uploadImage(result, album)
            uploaded = [imageEntity]
          }
          // 刷新缓存
          if (album?.id) {
            imgur.refreshAlbumImages(album.id)
          } else {
            imgur.refreshImages()
          }
          // mutate album cache
        } catch (err) {
          alert.alertWithType('error', '错误', err.message)
          Sentry.Native.captureException(err)
        } finally {
          aIndicator.hide()
        }
      }}>
      <ArrowUpTrayIcon size={22} color={props.tintColor} />
      {/* <Text className="text-neutral-900 font-medium text-base text-tracking-whider">
        上传
      </Text> */}
    </Pressable>
  )
}
